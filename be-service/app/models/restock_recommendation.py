from pydantic import BaseModel

class RestockRecommendationRequest(
    BaseModel
):
    budget: float
    horizon_days: int