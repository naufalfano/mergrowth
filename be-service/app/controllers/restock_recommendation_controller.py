import pandas as pd
from app.service.supabase import supabase

from app.controllers.demand_forecasting_helper import (
    get_forecast
)

def generate(budget: float, horizon_days: int):
    products = (
        supabase
        .table("product")
        .select("*")
        .execute()
    )

    product_df = pd.DataFrame(
        products.data
    )
    prices = (
    supabase
    .table("product_price")
    .select("*")
    .execute()
    )

    price_df = pd.DataFrame(
        prices.data
    )

    results = []

    for _, product in product_df.iterrows():

        forecast = get_forecast(
            product["product_id"],
            horizon_days
        )

        results.append({

            "product_id":
                product["product_id"],

            "product_name":
                product["product_name"],

            "current_stock":
                product["current_stock"],

            "forecast_quantity":
                forecast
        })
    forecast_df = pd.DataFrame(
        results
    )

    recommendation_df = (
        forecast_df.merge(
            price_df[
                [
                    "product_id",
                    "base_price",
                    "sale_price"
                ]
            ],
            on="product_id",
            how="left"
        )
    )

    recommendation_df["need"] = (
        recommendation_df["forecast_quantity"]
        -
        recommendation_df["current_stock"]
    )

    recommendation_df["need"] = (
        recommendation_df["need"]
        .clip(lower=0)
    )

    recommendation_df["margin"] = (
        recommendation_df["sale_price"]
        -
        recommendation_df["base_price"]
    )

    recommendation_df["shortage_ratio"] = (
        recommendation_df["need"]
        /
        recommendation_df["forecast_quantity"]
    )

    recommendation_df["shortage_ratio"] = (
        recommendation_df["shortage_ratio"]
        .fillna(0)
    )

    recommendation_df["unit_value"] = (
        recommendation_df["margin"]
        *
        recommendation_df["shortage_ratio"]
    )

    items = []

    for _, row in recommendation_df.iterrows():

        need = int(row["need"])

        if need <= 0:
            continue

        for _ in range(need):

            items.append({

                "product_id":
                    row["product_id"],

                "product_name":
                    row["product_name"],

                "cost":
                    int(
                        row["base_price"]
                    ),

                "value":
                    int(
                        row["unit_value"]
                    )
            })
    
    items_df = pd.DataFrame(
        items
    )

    items_df["roi"] = (
        items_df["value"]
        /
        items_df["cost"]
    )

    items_df = (
        items_df
        .sort_values(
            "roi",
            ascending=False
        )
    )

    used_budget = 0

    selected_items = []

    for _, item in items_df.iterrows():

        if (
            used_budget +
            item["cost"]
            <= budget
        ):

            selected_items.append(
                item
            )

            used_budget += (
                item["cost"]
            )
    
    selected_df = pd.DataFrame(
        selected_items
    )

    recommendation = (
        selected_df
        .groupby(
            [
                "product_id",
                "product_name"
            ]
        )
        .size()
        .reset_index(
            name="recommended_qty"
        )
    )

    financials = (
        selected_df
        .groupby(
            [
                "product_id",
                "product_name"
            ]
        )
        .agg(
            total_cost=(
                "cost",
                "sum"
            ),
            expected_profit=(
                "value",
                "sum"
            )
        )
        .reset_index()
    )

    recommendation = (
        recommendation.merge(
            financials,
            on=[
                "product_id",
                "product_name"
            ]
        )
    )

    return {
        "budget":
            budget,
        
        "horizon_days":
            horizon_days,

        "used_budget":
            int(
                used_budget
            ),

        "remaining_budget":
            int(
                budget -
                used_budget
            ),

        "expected_profit":
            int(
                recommendation[
                    "expected_profit"
                ].sum()
            ),

        "recommendations":
            recommendation.to_dict(
                orient="records"
            )
    }