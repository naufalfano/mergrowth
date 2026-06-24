from fastapi import HTTPException

from app.service.corpus_pipeline import (
    SUPPORTED_CATEGORIES,
    load_cache,
    save_cache,
    run_corpus_pipeline,
)

# Populated at import time from corpus_output.json (if it exists).
# Cache key = category string.
_cache: dict[str, dict] = load_cache()


def analyze(category: str) -> dict:
    category = category.strip().lower()

    if category not in SUPPORTED_CATEGORIES:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Unsupported category '{category}'. "
                f"Available: {SUPPORTED_CATEGORIES}"
            ),
        )

    if category in _cache:
        return _cache[category]

    try:
        result = run_corpus_pipeline(category, top_n=20)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed: {exc}",
        ) from exc

    _cache[category] = result
    save_cache(_cache)
    return result
