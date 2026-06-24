from fastapi import APIRouter, Query

from app.models.common import ApiResponse
from app.models.transaction import *

from app.controllers import marketing_controller

router = APIRouter(
    prefix="/marketing",
    tags=["marketing"]
)

@router.get("/forecast/revenue")
def forecast_revenue():
    return marketing_controller.revenue_forecast()

@router.get("/recommendation")
def recommendation(
    product_id: int,
    product_id_2: int | None = None
):
    return marketing_controller.recommendation(
        product_id=product_id,
        product_id_2=product_id_2
    )

@router.get("/product-insight")
def product_insight():
    return marketing_controller.product_insight()

