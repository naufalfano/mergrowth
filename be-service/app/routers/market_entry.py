from fastapi import APIRouter

from app.models.common import ApiResponse
from app.models.market_entry import MarketEntryRequest
from app.controllers import market_entry_controller

router = APIRouter(
    prefix="/market-entry",
    tags=["market-entry"],
)


@router.post("/analyze", response_model=ApiResponse)
def analyze(payload: MarketEntryRequest):
    data = market_entry_controller.analyze(payload)
    return ApiResponse(
        success=True,
        message="Analysis complete",
        data=data,
    )
