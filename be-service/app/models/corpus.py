from typing import Literal
from pydantic import BaseModel


class CorpusAnalysisRequest(BaseModel):
    category: str


class TermResult(BaseModel):
    term: str
    score: float
    sentiment: Literal["positive", "neutral", "negative"]
    freq: int


class CorpusAnalysisResponse(BaseModel):
    category: str
    top_terms: list[TermResult]
    total_reviews_analyzed: int
