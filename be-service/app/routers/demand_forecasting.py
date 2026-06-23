from fastapi import APIRouter

from app.models.common import ApiResponse
from app.models.demand_forecasting import (
    DemandForecastRequest,
    DemandForecastResponse
)

from app.controllers import demand_forecasting_controller

router = APIRouter(
    prefix="/demand-forecasting",
    tags=["demand-forecasting"]
)


@router.post(
    "/predict",
    response_model=ApiResponse[DemandForecastResponse]
)
def predict(
    payload: DemandForecastRequest
):
    data = demand_forecasting_controller.predict(
        payload
    )

    return ApiResponse(
        success=True,
        message="Forecast generated successfully",
        data=data
    )