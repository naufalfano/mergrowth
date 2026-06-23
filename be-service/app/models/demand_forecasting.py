from pydantic import BaseModel


class DemandForecastRequest(BaseModel):
    product_id: int
    horizon_days: int


class DemandForecastResponse(BaseModel):
    product_id: int
    forecast_quantity: int
    current_stock: int
    remaining_stock: int
    recommendation: str