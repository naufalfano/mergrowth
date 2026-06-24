"""
Competitor Review Corpus Pipeline
Translates ml-service/corpus_pipeline.ipynb (Feature 4) into a reusable service module.

Models and dataset are loaded lazily on first use and cached at module level.
Results are persisted to ml-model/corpus_output.json so restarts skip recomputation.
"""
import re
import json
import random
import warnings
from collections import Counter, defaultdict
from pathlib import Path
from typing import Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

warnings.filterwarnings("ignore")

INDONESIAN_STOPWORDS = [
    "yang","dan","di","ke","dari","ini","itu","dengan","untuk","pada",
    "adalah","tidak","juga","sudah","saya","kami","kita","mereka","ada",
    "bisa","atau","tapi","karena","jika","maka","lagi","lebih","sangat",
    "sekali","punya","akan","telah","saat","nya","si","pun","kok","deh",
    "sih","dong","ya","ga","gak","nggak","bang","kak","min","toko","seller",
]

SENTIMENT_LABEL_MAP = {
    "LABEL_0": "positive",
    "LABEL_1": "neutral",
    "LABEL_2": "negative",
}

SUPPORTED_CATEGORIES = ["elektronik", "fashion", "olahraga", "handphone", "pertukangan"]

CORPUS_CACHE_PATH = Path("ml-model/corpus_output.json")

# ── Module-level lazy singletons ──────────────────────────────────────────────

_dataset_by_category: Optional[dict] = None
_stemmer = None               # False = unavailable, None = not yet attempted
_kw_model = None
_sentiment_clf = None
_stopword_set = set(INDONESIAN_STOPWORDS)
_punct_re = re.compile(r"[^\w\s]")


def _get_stemmer():
    global _stemmer
    if _stemmer is None:
        try:
            from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
            _stemmer = StemmerFactory().create_stemmer()
        except ImportError:
            _stemmer = False
    return None if _stemmer is False else _stemmer


def _load_dataset() -> dict:
    global _dataset_by_category
    if _dataset_by_category is not None:
        return _dataset_by_category

    from datasets import load_dataset as hf_load
    ds = hf_load("farhamu/tokopedia-product-reviews-2019", split="train")

    by_category: dict[str, list] = defaultdict(list)
    for row in ds:
        if (
            row["rating"] != 3
            and isinstance(row["text"], str)
            and len(row["text"].split()) >= 5
        ):
            by_category[row["category"]].append(row)

    _dataset_by_category = dict(by_category)
    return _dataset_by_category


def _get_kw_model():
    global _kw_model
    if _kw_model is None:
        from keybert import KeyBERT
        _kw_model = KeyBERT(model="paraphrase-multilingual-MiniLM-L12-v2")
    return _kw_model


def _get_sentiment_clf():
    global _sentiment_clf
    if _sentiment_clf is None:
        from transformers import pipeline as hf_pipeline
        _sentiment_clf = hf_pipeline(
            "text-classification",
            model="mdhugol/indonesia-bert-sentiment-classification",
            device=-1,       # CPU
            truncation=True,
            max_length=128,
        )
    return _sentiment_clf


# ── Pipeline steps ────────────────────────────────────────────────────────────

def _preprocess(text: str) -> str:
    text = text.lower()
    text = _punct_re.sub(" ", text)
    tokens = [t for t in text.split() if t not in _stopword_set and len(t) > 1]
    stemmer = _get_stemmer()
    if stemmer:
        tokens = [stemmer.stem(t) for t in tokens]
    return " ".join(tokens)


def _get_tfidf_terms(reviews: list[str], top_n: int = 50) -> dict[str, float]:
    processed = [_preprocess(r) for r in reviews]
    processed = [p for p in processed if p.strip()]
    if len(processed) < 3:
        return {}

    vec = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=500,
        min_df=3,
        stop_words=INDONESIAN_STOPWORDS,
    )
    X = vec.fit_transform(processed)
    terms = vec.get_feature_names_out()
    mean_scores = np.asarray(X.mean(axis=0)).flatten()
    ranked = sorted(zip(terms, mean_scores), key=lambda x: -x[1])
    return {term: float(score) for term, score in ranked[:top_n]}


def _get_keybert_terms(
    reviews: list[str],
    top_n: int = 50,
    sample_size: int = 200,
) -> dict[str, float]:
    kw_model = _get_kw_model()
    sample = random.sample(reviews, min(sample_size, len(reviews)))

    phrase_scores: dict[str, list[float]] = defaultdict(list)
    for text in sample:
        try:
            kws = kw_model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 2),
                stop_words=INDONESIAN_STOPWORDS,
                top_n=5,
            )
            for phrase, score in kws:
                phrase_scores[phrase.lower()].append(score)
        except Exception:
            continue

    aggregated = {
        phrase: float(np.mean(scores)) * (len(scores) ** 0.5)
        for phrase, scores in phrase_scores.items()
        if len(scores) >= 2
    }
    if not aggregated:
        return {}

    max_val = max(aggregated.values())
    return {
        p: s / max_val
        for p, s in sorted(aggregated.items(), key=lambda x: -x[1])[:top_n]
    }


def _classify_term_sentiment(
    term: str,
    reviews: list[str],
    max_sentences: int = 30,
) -> str:
    clf = _get_sentiment_clf()
    containing = [r for r in reviews if term.lower() in r.lower()][:max_sentences]
    if not containing:
        return "neutral"
    results = clf(containing, batch_size=8)
    labels = [SENTIMENT_LABEL_MAP.get(r["label"], "neutral") for r in results]
    return Counter(labels).most_common(1)[0][0]


def _count_term_freq(terms: list[str], reviews: list[str]) -> dict[str, int]:
    counts = {}
    for term in terms:
        pat = re.compile(re.escape(term), re.IGNORECASE)
        counts[term] = sum(1 for r in reviews if pat.search(r))
    return counts


def _merge_and_rank(
    tfidf_scores: dict[str, float],
    keybert_scores: dict[str, float],
    freq_counts: dict[str, int],
    top_n: int = 20,
) -> list[tuple[str, float]]:
    all_terms = set(tfidf_scores) | set(keybert_scores)

    def norm(d: dict) -> dict:
        if not d:
            return {}
        mx = max(d.values()) or 1
        return {k: v / mx for k, v in d.items()}

    tf_n   = norm(tfidf_scores)
    kb_n   = norm(keybert_scores)
    freq_n = norm(freq_counts)

    combined = {
        term: (
            0.5 * tf_n.get(term, 0.0)
            + 0.3 * kb_n.get(term, 0.0)
            + 0.2 * freq_n.get(term, 0.0)
        )
        for term in all_terms
    }
    return sorted(combined.items(), key=lambda x: -x[1])[:top_n]


# ── Cache persistence ─────────────────────────────────────────────────────────

def load_cache() -> dict[str, dict]:
    """Load persisted results from corpus_output.json."""
    if CORPUS_CACHE_PATH.exists():
        with open(CORPUS_CACHE_PATH, encoding="utf-8") as f:
            data = json.load(f)
        return {r["category"]: r for r in data.get("results", [])}
    return {}


def save_cache(cache: dict[str, dict]) -> None:
    CORPUS_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CORPUS_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump({"results": list(cache.values())}, f, ensure_ascii=False, indent=2)


# ── Public entry point ────────────────────────────────────────────────────────

def run_corpus_pipeline(category: str, top_n: int = 20) -> dict:
    by_category = _load_dataset()

    rows = by_category.get(category)
    if not rows:
        rows = next(
            (v for k, v in by_category.items() if k.lower() == category.lower()),
            None,
        )
    if not rows:
        raise ValueError(
            f"Category '{category}' not found. Available: {SUPPORTED_CATEGORIES}"
        )

    reviews = [r["text"] for r in rows]

    tfidf_scores   = _get_tfidf_terms(reviews, top_n=top_n * 3)
    keybert_scores = _get_keybert_terms(reviews, top_n=top_n * 3)

    candidate_terms = list(set(tfidf_scores) | set(keybert_scores))
    freq_counts     = _count_term_freq(candidate_terms, reviews)

    ranked         = _merge_and_rank(tfidf_scores, keybert_scores, freq_counts, top_n=top_n)
    top_terms_list = [t for t, _ in ranked]
    sentiments     = {term: _classify_term_sentiment(term, reviews) for term in top_terms_list}

    return {
        "category": category,
        "top_terms": [
            {
                "term":      term,
                "score":     round(score, 4),
                "sentiment": sentiments[term],
                "freq":      freq_counts.get(term, 0),
            }
            for term, score in ranked
        ],
        "total_reviews_analyzed": len(reviews),
    }
