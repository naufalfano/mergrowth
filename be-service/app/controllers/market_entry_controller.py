import json
import numpy as np
import joblib
from fastapi import HTTPException, status
from app.models.market_entry import MarketEntryRequest

bundle    = joblib.load("ml-model/category_classifier.pkl")
clf       = bundle["clf"]
tfidf     = bundle["tfidf"]

with open("ml-model/market_analysis.json", encoding="utf-8") as f:
    market_data: dict = json.load(f)

CONFIDENCE_THRESHOLD = 0.40

CATEGORY_MAP: dict[str, str] = {
    "Fashion":         "Fashion",
    "Electronics":     "Electronics",
    "Beauty":          "Beauty",
    "Food & Beverage": "Food",
    "Home & Living":   "Home",
    "Sports":          "Sports",
    "Toys":            "Kids",
    "Books":           "Books",
    "Automotive":      "Automotive",
    "Pets":            "Pets",
    "Tools":           "Tools",
}

DISPLAY_MAP: dict[str, str] = {v: k for k, v in CATEGORY_MAP.items()}

def get_gap_tier(tiers: list[dict]) -> dict:
    gap = next((t for t in tiers if t["is_gap"]), None)
    return gap if gap else min(tiers, key=lambda t: t["gap_share"])


def build_result(internal_category: str, confidence: float) -> dict:
    market = market_data.get(internal_category)
    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No market data for category '{internal_category}'",
        )

    tiers   = market["tiers"]
    gap     = get_gap_tier(tiers)
    display = DISPLAY_MAP.get(internal_category, internal_category)

    return {
        "category":          display,
        "confidence":        round(confidence, 3),
        "n_competitors":     market["n_listings"],
        "recommended_tier":  gap["tier"],
        "seller_share":      f"{gap['gap_share']:.1%}",
        "entry_price_range": gap["price_range"],
        "all_tiers":         tiers,
    }

def analyze(payload: MarketEntryRequest) -> dict:
    if payload.category:
        internal = CATEGORY_MAP.get(payload.category)
        if not internal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown category '{payload.category}'",
            )
        return build_result(internal, confidence=1.0)

    text  = payload.product_text.strip()
    vec   = tfidf.transform([text])
    proba = clf.predict_proba(vec)[0]

    confidence = float(proba.max())
    predicted  = clf.classes_[int(np.argmax(proba))]

    if confidence < CONFIDENCE_THRESHOLD:
        top3 = sorted(
            zip(clf.classes_, proba.tolist()),
            key=lambda x: -x[1],
        )[:3]
        return {
            "status":  "low_confidence",
            "message": "Deskripsi terlalu umum — pilih kategori secara manual",
            "top_categories": [
                {"category": DISPLAY_MAP.get(c, c), "score": round(s, 3)}
                for c, s in top3
            ],
        }

    return build_result(predicted, confidence)
