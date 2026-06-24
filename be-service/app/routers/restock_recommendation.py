from fastapi import APIRouter

from app.models.restock_recommendation import (
    RestockRecommendationRequest
)

from app.controllers.restock_recommendation_controller import (
    generate
)

router = APIRouter(
    prefix="/restock-recommendation",
    tags=["restock-recommendation"]
)

@router.post("")
def get_recommendation(
    payload:
    RestockRecommendationRequest
):

    result = generate(
        payload.budget,
        payload.horizon_days
    )

    return {
        "success": True,
        "message":
            "Recommendation generated successfully",
        "data":
            result
    }