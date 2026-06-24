from fastapi import HTTPException, status
from app.service.supabase import supabase
import pandas as pd
import json
import joblib
from collections import defaultdict
from statistics import median

MODEL_PATH = (
    "ml-model/rf_weekly_revenue_forecast.pkl"
)

def get_all_transactions():
    all_data = []
    page_size = 1000
    offset = 0

    while True:

        batch = (
            supabase.table("transaction")
            .select("transaction_id, total_price, created_at")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not batch.data:
            break

        all_data.extend(batch.data)

        if len(batch.data) < page_size:
            break

        offset += page_size

    return all_data

def get_weekly_revenue():

    transactions = get_all_transactions()

    df = pd.DataFrame(transactions)

    df["created_at"] = pd.to_datetime(
        df["created_at"]
    )

    weekly_revenue = (
        df.groupby(
            pd.Grouper(
                key="created_at",
                freq="W-MON"
            )
        )["total_price"]
        .sum()
        .reset_index()
    )

    weekly_revenue.columns = [
        "date",
        "revenue"
    ]

    # Remove incomplete week
    weekly_revenue = weekly_revenue.iloc[:-1]

    return weekly_revenue

def revenue_forecast():

    try:

        weekly_revenue = get_weekly_revenue()

        model = joblib.load(
            MODEL_PATH
        )

        df = weekly_revenue.copy()

        df["lag_1"] = (
            df["revenue"].shift(1)
        )

        df["lag_2"] = (
            df["revenue"].shift(2)
        )

        df["lag_3"] = (
            df["revenue"].shift(3)
        )

        df["lag_4"] = (
            df["revenue"].shift(4)
        )

        df["week"] = (
            df["date"]
            .dt.isocalendar()
            .week
        )

        df["month"] = (
            df["date"]
            .dt.month
        )

        df = df.dropna()

        last_row = df.iloc[-1]

        next_week = pd.DataFrame([
            {
                "lag_1": last_row["revenue"],
                "lag_2": last_row["lag_1"],
                "lag_3": last_row["lag_2"],
                "lag_4": last_row["lag_3"],
                "week": (
                    int(last_row["week"]) % 52
                ) + 1,
                "month": (
                    last_row["date"]
                    + pd.DateOffset(weeks=1)
                ).month
            }
        ])

        forecast_revenue = float(
            model.predict(
                next_week
            )[0]
        )

        current_revenue = float(
            last_row["revenue"]
        )

        growth_percent = (
            (
                forecast_revenue
                - current_revenue
            )
            / current_revenue
        ) * 100

        return {
            "current_week": {
                "revenue": round(current_revenue)
            },
            "next_week": {
                "revenue": round(forecast_revenue)
            },
            "growth_percent": round(
                growth_percent,
                2
            ),
            "trend": (
                "up"
                if growth_percent > 0
                else "down"
            )
        }

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

def recommendation(
    product_id: int,
    product_id_2: int | None = None
):
    try:

        # Load products
        products = (
            supabase.table("product")
            .select("product_id, product_name")
            .execute()
        )

        product_id_to_name = {
            p["product_id"]: p["product_name"]
            for p in products.data
        }

        # Validate product_id
        if product_id not in product_id_to_name:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {product_id} not found"
            )

        product_name = product_id_to_name[product_id]

        product_name_2 = None

        if product_id_2 is not None:

            if product_id_2 not in product_id_to_name:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {product_id_2} not found"
                )

            product_name_2 = product_id_to_name[
                product_id_2
            ]

        # Load Apriori rules
        with open(
            "ml-model/association_rules.json",
            "r",
            encoding="utf-8"
        ) as f:

            rules = json.load(f)

        recommendations = []

        # LEVEL 1
        if product_id_2 is None:

            for rule in rules:

                if (
                    len(rule["antecedents"]) == 1
                    and rule["antecedents"][0]
                    == product_name
                    and len(rule["consequents"]) == 1
                ):

                    recommendations.append(
                        {
                            "product_name":
                                rule["consequents"][0],
                            "support": round(
                                rule["support"],
                                4
                            ),
                            "confidence": round(
                                rule["confidence"],
                                4
                            ),
                            "lift": round(
                                rule["lift"],
                                4
                            )
                        }
                    )

            recommendations = sorted(
                recommendations,
                key=lambda x: x["confidence"],
                reverse=True
            )

            return {
                "level": 1,
                "product_id": product_id,
                "product_name": product_name,
                "recommendations": recommendations
            }

        # LEVEL 2

        antecedent_set = {
            product_name,
            product_name_2
        }

        for rule in rules:

            if (
                len(rule["antecedents"]) == 2
                and len(rule["consequents"]) == 1
            ):

                if (
                    set(rule["antecedents"])
                    == antecedent_set
                ):

                    recommendations.append(
                        {
                            "product_name":
                                rule["consequents"][0],
                            "support": round(
                                rule["support"],
                                4
                            ),
                            "confidence": round(
                                rule["confidence"],
                                4
                            ),
                            "lift": round(
                                rule["lift"],
                                4
                            )
                        }
                    )

        recommendations = sorted(
            recommendations,
            key=lambda x: x["confidence"],
            reverse=True
        )

        return {
            "level": 2,
            "product_ids": [
                product_id,
                product_id_2
            ],
            "product_names": [
                product_name,
                product_name_2
            ],
            "recommendations": recommendations
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
def get_product_map():

    response = (
        supabase.table("product")
        .select(
            "product_id, product_name"
        )
        .execute()
    )

    return {
        row["product_id"]: row["product_name"]
        for row in response.data
    }

def get_product_price_map():

    response = (
        supabase.table("product_price")
        .select(
            """
            product_id,
            base_price,
            sale_price
            """
        )
        .execute()
    )

    return {
        row["product_id"]:
        {
            "base_price": row["base_price"],
            "sale_price": row["sale_price"]
        }
        for row in response.data
    }

def get_all_transaction_details():

    all_data = []

    page_size = 1000
    offset = 0

    while True:

        batch = (
            supabase.table("transaction_detail")
            .select("product_id")
            .range(
                offset,
                offset + page_size - 1
            )
            .execute()
        )

        if not batch.data:
            break

        all_data.extend(batch.data)

        if len(batch.data) < page_size:
            break

        offset += page_size

    return all_data

def product_insight():

    try:

        rows = get_all_transaction_details()

        product_map = get_product_map()

        price_map = get_product_price_map()

        stats = defaultdict(
            lambda: {
                "sold_qty": 0
            }
        )

        # =====================================
        # Aggregate Quantity Sold
        # =====================================

        for row in rows:

            product_id = row["product_id"]

            stats[
                product_id
            ]["sold_qty"] += 1

        # =====================================
        # Build Product Feature Table
        # =====================================

        products = []

        for product_id, value in stats.items():

            if product_id not in price_map:
                continue

            sold_qty = value["sold_qty"]

            sale_price = (
                price_map[product_id]
                ["sale_price"]
            )

            base_price = (
                price_map[product_id]
                ["base_price"]
            )

            revenue = (
                sold_qty
                * sale_price
            )

            cost = (
                sold_qty
                * base_price
            )

            net_profit = (
                revenue
                - cost
            )

            margin = 0

            if revenue > 0:

                margin = (
                    net_profit
                    / revenue
                ) * 100

            products.append(
                {
                    "product_id": product_id,
                    "product_name":
                        product_map.get(
                            product_id,
                            f"Product {product_id}"
                        ),
                    "sold_qty": sold_qty,
                    "revenue": revenue,
                    "net_profit": net_profit,
                    "margin": round(
                        margin,
                        2
                    )
                }
            )

        if not products:

            return {
                "summary": {},
                "products": []
            }

        df = pd.DataFrame(products)

        # =====================================
        # Load ML Model
        # =====================================

        scaler = joblib.load(
            "ml-model/product_cluster_scaler.pkl"
        )

        kmeans = joblib.load(
            "ml-model/product_cluster.pkl"
        )

        with open(
            "ml-model/cluster_mapping.json",
            "r",
            encoding="utf-8"
        ) as f:

            cluster_mapping = json.load(f)

        X = df[
            [
                "sold_qty",
                "revenue",
                "net_profit",
                "margin"
            ]
        ]

        X_scaled = scaler.transform(
            X
        )

        df["cluster"] = (
            kmeans.predict(
                X_scaled
            )
        )

        df["segment"] = (
            df["cluster"]
            .astype(str)
            .map(cluster_mapping)
        )

        # =====================================
        # Business Score
        # =====================================

        df["profit_rank"] = (
            df["net_profit"]
            .rank(
                pct=True
            )
        )

        df["sold_rank"] = (
            df["sold_qty"]
            .rank(
                pct=True
            )
        )

        df["margin_rank"] = (
            df["margin"]
            .rank(
                pct=True
            )
        )

        df["business_score"] = (
            (
                df["profit_rank"]
                * 0.4
            )
            +
            (
                df["sold_rank"]
                * 0.3
            )
            +
            (
                df["margin_rank"]
                * 0.3
            )
        )

        # =====================================
        # Load Association Rules
        # =====================================

        with open(
            "ml-model/association_rules.json",
            "r",
            encoding="utf-8"
        ) as f:

            rules = json.load(f)

        recommendations = []

        # =====================================
        # Product Recommendation Engine
        # =====================================

        for _, row in df.iterrows():

            product_name = (
                row["product_name"]
            )

            associated_products = []

            for rule in rules:

                if (
                    product_name
                    in rule["antecedents"]
                ):

                    associated_products.extend(
                        rule["consequents"]
                    )

                elif (
                    product_name
                    in rule["consequents"]
                ):

                    associated_products.extend(
                        rule["antecedents"]
                    )

            associated_products = list(
                set(
                    associated_products
                )
            )

            # =====================================
            # Category Logic
            # =====================================

            if (
                row["segment"]
                == "CORE_PRODUCT"
            ):

                category = (
                    "CORE_PRODUCT"
                )

                recommendation = (
                    "Core product. Maintain inventory, prioritize stock availability, and continue promotion."
                )

            else:

                if len(
                    associated_products
                ) > 0:

                    category = (
                        "BUNDLE_OPPORTUNITY"
                    )

                    recommendation = (
                        "Bundle with: "
                        + ", ".join(
                            associated_products[:3]
                        )
                    )

                elif (
                    row["business_score"]
                    <= 0.20
                ):

                    category = (
                        "REMOVAL_CANDIDATE"
                    )

                    recommendation = (
                        "Low sales, low profitability, and weak product association. Consider repricing, repositioning, or discontinuing."
                    )

                else:

                    category = (
                        "MONITOR_PRODUCT"
                    )

                    recommendation = (
                        "Monitor performance. Product is profitable but lacks strong bundle opportunities."
                    )

            recommendations.append(
                {
                    "product_id":
                        int(
                            row["product_id"]
                        ),

                    "product_name":
                        product_name,

                    "segment":
                        row["segment"],

                    "category":
                        category,

                    "sold_qty":
                        int(
                            row["sold_qty"]
                        ),

                    "revenue":
                        int(
                            row["revenue"]
                        ),

                    "net_profit":
                        int(
                            row["net_profit"]
                        ),

                    "margin":
                        round(
                            float(
                                row["margin"]
                            ),
                            2
                        ),

                    "business_score":
                        round(
                            float(
                                row["business_score"]
                            ),
                            4
                        ),

                    "profit_rank":
                        round(
                            float(
                                row["profit_rank"]
                            ),
                            4
                        ),

                    "sold_rank":
                        round(
                            float(
                                row["sold_rank"]
                            ),
                            4
                        ),

                    "margin_rank":
                        round(
                            float(
                                row["margin_rank"]
                            ),
                            4
                        ),

                    "associated_products":
                        associated_products,

                    "recommendation":
                        recommendation
                }
            )

        # =====================================
        # Dashboard Categories
        # =====================================

        core_products = [
            p
            for p in recommendations
            if p["category"]
            == "CORE_PRODUCT"
        ]

        bundle_opportunities = [
            p
            for p in recommendations
            if p["category"]
            == "BUNDLE_OPPORTUNITY"
        ]

        monitor_products = [
            p
            for p in recommendations
            if p["category"]
            == "MONITOR_PRODUCT"
        ]

        removal_candidates = [
            p
            for p in recommendations
            if p["category"]
            == "REMOVAL_CANDIDATE"
        ]

        # =====================================
        # Final Response
        # =====================================

        return {

            "summary": {

                "core_products":
                    len(
                        core_products
                    ),

                "bundle_opportunities":
                    len(
                        bundle_opportunities
                    ),

                "monitor_products":
                    len(
                        monitor_products
                    ),

                "removal_candidates":
                    len(
                        removal_candidates
                    )
            },

            "core_products":
                sorted(
                    core_products,
                    key=lambda x:
                    x["business_score"],
                    reverse=True
                ),

            "bundle_opportunities":
                sorted(
                    bundle_opportunities,
                    key=lambda x:
                    x["business_score"],
                    reverse=True
                ),

            "monitor_products":
                sorted(
                    monitor_products,
                    key=lambda x:
                    x["business_score"],
                    reverse=True
                ),

            "removal_candidates":
                sorted(
                    removal_candidates,
                    key=lambda x:
                    x["business_score"]
                ),

            "products":
                sorted(
                    recommendations,
                    key=lambda x:
                    x["business_score"],
                    reverse=True
                )
        }

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    