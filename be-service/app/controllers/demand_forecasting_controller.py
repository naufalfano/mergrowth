from app.models.demand_forecasting import (
    DemandForecastRequest
)

from app.service.supabase import supabase

from app.controllers.demand_forecasting_helper import (
    get_forecast
)


def predict(
    payload: DemandForecastRequest
):

    product = (
        supabase
        .table("product")
        .select("*")
        .eq(
            "product_id",
            payload.product_id
        )
        .single()
        .execute()
    )

    current_stock = (
        product.data["current_stock"]
    )

    forecast = get_forecast(
        payload.product_id,
        payload.horizon_days
    )

    remaining_stock = (
        current_stock -
        forecast
    )

    recommendation = (
        "Stock is sufficient"
        if remaining_stock >= 0
        else "Restock immediately"
    )

    return {
        "product_id":
            payload.product_id,

        "forecast_quantity":
            forecast,

        "current_stock":
            current_stock,

        "remaining_stock":
            remaining_stock,

        "recommendation":
            recommendation
    }