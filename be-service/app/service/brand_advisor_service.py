"""
Brand Advisor Service — Gemini-powered brand strategy generator.

Combines market gap data and competitor review corpus to prompt
Gemini 1.5 Flash and returns a structured brand strategy JSON.
"""
import json
import re

from google import genai
from google.genai import types

from app.service.config import settings

# ── Category mapping ──────────────────────────────────────────────────────────
# Corpus pipeline uses Indonesian lowercase; market_analysis.json uses English title-case.

CORPUS_TO_MARKET: dict[str, str] = {
    "elektronik":  "Electronics",
    "fashion":     "Fashion",
    "olahraga":    "Sports",
    "handphone":   "Electronics",
    "pertukangan": "Tools",
}

CORPUS_TO_DISPLAY: dict[str, str] = {
    "elektronik":  "Elektronik",
    "fashion":     "Fashion",
    "olahraga":    "Olahraga",
    "handphone":   "Handphone",
    "pertukangan": "Pertukangan",
}


def _format_rupiah(value: float) -> str:
    return f"Rp {int(value):,}".replace(",", ".")


def _build_prompt(
    corpus_category: str,
    market: dict,
    corpus: dict | None,
) -> str:
    display = CORPUS_TO_DISPLAY.get(corpus_category, corpus_category)

    # ── Market gap section ──
    tiers = market.get("tiers", [])
    rec_tier = market.get("recommended_tier", "—")
    n_listings = market.get("n_listings", 0)

    tier_rows = []
    for t in tiers:
        pr = t.get("price_range", {})
        gap_flag = " ← GAP" if t.get("is_gap") else ""
        tier_rows.append(
            f"  - {t['tier']}: "
            f"{_format_rupiah(pr.get('p25', 0))} – {_format_rupiah(pr.get('p75', 0))} median "
            f"(gap share {t.get('gap_share', 0):.1%}, {t.get('shop_count', 0)} competitors){gap_flag}"
        )
    tier_block = "\n".join(tier_rows) if tier_rows else "  (tidak tersedia)"

    # ── Corpus section ──
    if corpus:
        total_reviews = corpus.get("total_reviews_analyzed", 0)
        top_terms = corpus.get("top_terms", [])[:15]
        term_rows = [
            f"  {i+1:>2}. {t['term']:<20} score={t['score']:.3f}  sentiment={t['sentiment']:<8}  freq={t['freq']}"
            for i, t in enumerate(top_terms)
        ]
        corpus_block = (
            f"Total ulasan dianalisis: {total_reviews:,}\n"
            + "\n".join(term_rows)
        )
    else:
        corpus_block = "  (Data ulasan kompetitor belum tersedia untuk kategori ini)"

    prompt = f"""Kamu adalah konsultan strategi merek untuk penjual baru di e-commerce Indonesia (Tokopedia, Shopee, Lazada).

## Konteks Pasar: Kategori {display}

### 1. Analisis Gap Pasar (Segmen Harga)
Kategori market: {CORPUS_TO_MARKET.get(corpus_category, corpus_category)}
Total kompetitor: {n_listings:,} listing
Tier yang direkomendasikan: {rec_tier}

Segmen harga (berdasarkan clustering):
{tier_block}

### 2. Analisis Ulasan Kompetitor (Top Kata Kunci)
{corpus_block}

## Instruksi
Berdasarkan data pasar di atas, buatkan strategi merek untuk penjual baru yang ingin masuk ke kategori {display} di platform e-commerce Indonesia.

Kembalikan HANYA JSON valid dengan struktur persis seperti ini (tidak ada teks lain di luar JSON):

{{
  "brand_tone": {{
    "archetype": "<nama arketipe merek dalam 2-3 kata, Bahasa Indonesia>",
    "description": "<deskripsi 2-3 kalimat tentang karakter merek ini dan mengapa cocok untuk pasar {display} di Indonesia>",
    "traits": ["<sifat 1>", "<sifat 2>", "<sifat 3>", "<sifat 4>"]
  }},
  "price_positioning": {{
    "recommended_tier": "<nama tier: Budget/Mid/Premium atau variasinya>",
    "price_range": "<format: Rp X.000 – Rp Y.000>",
    "reasoning": "<alasan 2-3 kalimat mengapa rentang harga ini ideal berdasarkan data gap dan kompetitor>"
  }},
  "key_messages": [
    "<pesan utama 1 — max 15 kata>",
    "<pesan utama 2 — max 15 kata>",
    "<pesan utama 3 — max 15 kata>"
  ],
  "keywords_to_emphasize": ["<kata kunci 1>", "<kata kunci 2>", "<kata kunci 3>", "<kata kunci 4>", "<kata kunci 5>", "<kata kunci 6>"],
  "competitive_strategy": "<strategi kompetitif 3-4 kalimat: bagaimana membedakan diri dari kompetitor berdasarkan data ulasan>",
  "content_tone_guidelines": "<panduan nada konten 3-4 kalimat: cara menulis deskripsi produk, caption media sosial, dan balasan ke pembeli>"
}}

Aturan:
- Semua nilai dalam Bahasa Indonesia
- keywords_to_emphasize: pilih dari kata kunci yang muncul di data ulasan kompetitor di atas, terutama yang sentimen positif
- price_range harus konsisten dengan tier yang direkomendasikan dan data harga di atas
- Jangan tambahkan teks, komentar, atau markdown di luar JSON
"""
    return prompt


def _extract_json(text: str) -> dict:
    """Extract and parse JSON from Gemini response (handles markdown code fences)."""
    # Strip markdown fences if present
    text = re.sub(r"```(?:json)?", "", text).strip()
    # Find the outermost JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in Gemini response: {text[:200]}")
    return json.loads(match.group())


def generate_brand_strategy(corpus_category: str, market: dict, corpus: dict | None) -> dict:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured in environment variables.")

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = _build_prompt(corpus_category, market, corpus)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=1500,
        ),
    )

    result = _extract_json(response.text)
    result["category"] = corpus_category
    return result
