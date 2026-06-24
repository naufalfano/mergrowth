from fastapi import APIRouter

from app.models.common import ApiResponse
from app.models.brand_advisor import BrandAdvisorRequest, BrandAdvisorResponse
from app.controllers import brand_advisor_controller

router = APIRouter(prefix="/brand-advisor", tags=["brand-advisor"])


@router.post("/generate", response_model=ApiResponse[BrandAdvisorResponse])
def generate(payload: BrandAdvisorRequest):
    data = brand_advisor_controller.generate(payload.category)
    return ApiResponse(
        success=True,
        message="Brand strategy generated",
        data=data,
    )
