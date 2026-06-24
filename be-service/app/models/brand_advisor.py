from pydantic import BaseModel


class BrandAdvisorRequest(BaseModel):
    category: str


class BrandTone(BaseModel):
    archetype: str
    description: str
    traits: list[str]


class PricePositioning(BaseModel):
    recommended_tier: str
    price_range: str
    reasoning: str


class BrandAdvisorResponse(BaseModel):
    category: str
    brand_tone: BrandTone
    price_positioning: PricePositioning
    key_messages: list[str]
    keywords_to_emphasize: list[str]
    competitive_strategy: str
    content_tone_guidelines: str
