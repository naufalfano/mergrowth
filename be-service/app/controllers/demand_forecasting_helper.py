import joblib
import pandas as pd
import numpy as np

from app.service.supabase import supabase

model = joblib.load(
    "ml-model/demand_forecasting_model.pkl"
)

def get_forecast(
    product_id: int,
    horizon_days: int
) -> int:

    sales = (
        supabase
        .table("transaction_detail")
        .select(
            "product_id, created_at"
        )
        .eq(
            "product_id",
            product_id
        )
        .execute()
    )

    df = pd.DataFrame(sales.data)

    if len(df) == 0:
        return 0

    df["created_at"] = pd.to_datetime(
        df["created_at"]
    )

    daily_sales = (
        df.groupby(
            [
                "product_id",
                df["created_at"].dt.date
            ]
        )
        .size()
        .reset_index(name="quantity")
    )

    daily_sales["created_at"] = pd.to_datetime(
        daily_sales["created_at"]
    )

    weekly_sales = (
        daily_sales
        .set_index("created_at")
        .groupby("product_id")["quantity"]
        .resample("W")
        .sum()
        .reset_index()
    )

    product_weekly = (
        weekly_sales
        .sort_values("created_at")
        .copy()
    )

    product_weekly["lag_1"] = (
        product_weekly["quantity"]
        .shift(1)
    )

    product_weekly["lag_2"] = (
        product_weekly["quantity"]
        .shift(2)
    )

    product_weekly["lag_3"] = (
        product_weekly["quantity"]
        .shift(3)
    )

    product_weekly["ma_3"] = (
        product_weekly["quantity"]
        .shift(1)
        .rolling(3)
        .mean()
    )

    product_weekly["ma_5"] = (
        product_weekly["quantity"]
        .shift(1)
        .rolling(5)
        .mean()
    )

    product_weekly["week_of_year"] = (
        product_weekly["created_at"]
        .dt.isocalendar()
        .week
    )

    product_weekly["month"] = (
        product_weekly["created_at"]
        .dt.month
    )

    product_weekly = (
        product_weekly
        .dropna()
    )

    if len(product_weekly) == 0:
        return 0

    latest = product_weekly.iloc[-1]

    if horizon_days == 7:

        future = pd.DataFrame([{
            "product_id": product_id,
            "lag_1": latest["quantity"],
            "lag_2": latest["lag_1"],
            "lag_3": latest["lag_2"],
            "ma_3": latest["ma_3"],
            "ma_5": latest["ma_5"],
            "week_of_year":
                latest["week_of_year"] + 1,
            "month":
                latest["month"]
        }])

        return int(
            round(
                model.predict(future)[0]
            )
        )

    predictions = []

    lag1 = latest["quantity"]
    lag2 = latest["lag_1"]
    lag3 = latest["lag_2"]

    for i in range(4):

        future = pd.DataFrame([{
            "product_id": product_id,
            "lag_1": lag1,
            "lag_2": lag2,
            "lag_3": lag3,
            "ma_3": np.mean([
                lag1,
                lag2,
                lag3
            ]),
            "ma_5": latest["ma_5"],
            "week_of_year":
                latest["week_of_year"] + i + 1,
            "month":
                latest["month"]
        }])

        pred = model.predict(
            future
        )[0]

        predictions.append(pred)

        lag3 = lag2
        lag2 = lag1
        lag1 = pred

    return int(
        round(
            sum(predictions)
        )
    )