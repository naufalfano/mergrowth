from fastapi import APIRouter

from app.models.price_analysis import (
    ProductBenchmarkRequest,
    ProductPriceRecommendationRequest
)

from app.controllers.price_analysis_controller import (
    analyze_existing_product,
    recommend_price
)

router = APIRouter(
    prefix="/price-analysis",
    tags=["Price Analysis"]
)

@router.post(
    "/existing-product"
)
def analyze_product(
    payload:
    ProductBenchmarkRequest
):

    return {
        "success": True,
        "message":
            "Price analysis generated successfully",
        "data":
            analyze_existing_product(
                payload
            )
    }

@router.post(
    "/new-product"
)
def recommend_new_price(
    payload:
    ProductPriceRecommendationRequest
):

    return {
        "success": True,
        "message":
            "Price recommendation generated successfully",
        "data":
            recommend_price(
                payload
            )
    }