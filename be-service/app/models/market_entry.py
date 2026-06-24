from pydantic import BaseModel, model_validator
from typing import Optional


class MarketEntryRequest(BaseModel):
    product_text: Optional[str] = None
    category: Optional[str] = None

    @model_validator(mode="after")
    def require_one(self):
        if not self.product_text and not self.category:
            raise ValueError("Either product_text or category is required")
        return self


class PriceRange(BaseModel):
    p25: float
    median: float
    p75: float


class TierInfo(BaseModel):
    tier: str
    shop_count: int
    gap_share: float
    is_gap: bool
    price_range: PriceRange


class MarketEntryResult(BaseModel):
    category: str
    confidence: float
    n_competitors: int
    recommended_tier: Optional[str]
    seller_share: str
    entry_price_range: PriceRange
    all_tiers: list[TierInfo]


class CategorySuggestion(BaseModel):
    category: str
    score: float


class LowConfidenceResult(BaseModel):
    status: str
    message: str
    top_categories: list[CategorySuggestion]
