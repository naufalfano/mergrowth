import json
from pathlib import Path

from fastapi import HTTPException

from app.service.brand_advisor_service import (
    CORPUS_TO_MARKET,
    generate_brand_strategy,
)

# ── Market gap data (loaded once at import) ───────────────────────────────────

with open("ml-model/market_analysis.json", encoding="utf-8") as _f:
    _market_data: dict = json.load(_f)

# ── Corpus cache path (same file used by corpus_controller) ──────────────────

_CORPUS_CACHE = Path("ml-model/corpus_output.json")

SUPPORTED_CATEGORIES = list(CORPUS_TO_MARKET.keys())


def _load_corpus_cache() -> dict[str, dict]:
    if _CORPUS_CACHE.exists():
        with open(_CORPUS_CACHE, encoding="utf-8") as f:
            data = json.load(f)
        return {r["category"]: r for r in data.get("results", [])}
    return {}


def generate(category: str) -> dict:
    category = category.strip().lower()

    if category not in SUPPORTED_CATEGORIES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported category '{category}'. Available: {SUPPORTED_CATEGORIES}",
        )

    # Get market gap data (mapped from corpus category → market category key)
    market_key = CORPUS_TO_MARKET[category]
    market = _market_data.get(market_key)
    if not market:
        raise HTTPException(
            status_code=404,
            detail=f"No market gap data found for '{market_key}'.",
        )

    # Get corpus data from cache (optional — prompt still works without it)
    corpus_cache = _load_corpus_cache()
    corpus = corpus_cache.get(category)

    try:
        result = generate_brand_strategy(category, market, corpus)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Brand strategy generation failed: {exc}",
        ) from exc

    return result
