import pandas as pd
import re
import numpy as np

from sklearn.feature_extraction.text import (
    TfidfVectorizer
)

from sklearn.metrics.pairwise import (
    cosine_similarity
)

from app.service.supabase import (
    supabase
)

from app.models.price_analysis import (
    ProductBenchmarkRequest,
    ProductPriceRecommendationRequest
)

# ==================================================
# LOAD MARKETPLACE DATA
# ==================================================

tokopedia_df = pd.read_csv(
    "../ml-service/produk_tokopedia.csv"
)

# ==================================================
# CLEANING
# ==================================================

def clean_text(text):

    text = str(text).lower()

    text = re.sub(
        r"\d+\s*(gr|gram|kg|ml|lt|l)",
        "",
        text
    )

    text = re.sub(
        r"[^a-zA-Z\s]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()

# ==================================================
# PREPARE DATA
# ==================================================

tokopedia_df["text"] = (
    tokopedia_df["Nama Produk"]
    .fillna("")
    .apply(clean_text)
)

# ==================================================
# TF-IDF
# ==================================================

vectorizer = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 3),
    min_df=2
)

market_matrix = (
    vectorizer.fit_transform(
        tokopedia_df["text"]
    )
)

# ==================================================
# HELPERS
# ==================================================

def get_price_position(
    current_price,
    average_price
):

    diff = (
        current_price -
        average_price
    ) / average_price * 100

    if diff <= -10:
        return "Below Market"

    elif diff >= 10:
        return "Above Market"

    return "At Market"


def get_similar_market_products(
    query,
    top_n=10
):

    query = clean_text(
        query
    )

    query_vector = (
        vectorizer.transform(
            [query]
        )
    )

    similarities = cosine_similarity(
        query_vector,
        market_matrix
    ).flatten()

    top_indices = (
        similarities
        .argsort()[::-1][:100]
    )

    result = (
        tokopedia_df
        .iloc[top_indices]
        .copy()
    )

    result["similarity"] = (
        similarities[top_indices]
    )

    result = result[
        result["similarity"] >= 0.20
    ]

    return (
        result
        .sort_values(
            "similarity",
            ascending=False
        )
        .head(top_n)
    )

# ==================================================
# EXISTING PRODUCT ANALYSIS
# ==================================================

def analyze_existing_product(
    payload:
    ProductBenchmarkRequest
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

    price = (
        supabase
        .table("product_price")
        .select("*")
        .eq(
            "product_id",
            payload.product_id
        )
        .single()
        .execute()
    )
    base_price = (
        price.data["base_price"]
    )

    current_price = (
        price.data["sale_price"]
    )

    benchmark = (
        get_similar_market_products(
            product.data[
                "product_name"
            ]
        )
    )

    prices = benchmark["Harga (IDR)"]

    q1 = prices.quantile(0.25)
    q3 = prices.quantile(0.75)

    iqr = q3 - q1

    filtered_prices = prices[
        (prices >= q1 - 1.5 * iqr)
        &
        (prices <= q3 + 1.5 * iqr)
    ]

    market_price = (
        filtered_prices
        .median()
    )

    target_margin = 0.30

    cost_based_price = (
        base_price *
        (1 + target_margin)
    )
    recommended_price = round(
        max(
            market_price,
            cost_based_price
        )
    )
    expected_margin = (
        recommended_price -
        base_price
    )

    margin_percentage = round(
        (
            expected_margin /
            base_price
        ) * 100,
        2
    )
    price_gap = (
        recommended_price -
        current_price
    )
    if price_gap > 0:

        recommendation = (
            f"Increase price by Rp {price_gap:,}"
        )

    elif price_gap < 0:

        recommendation = (
            f"Decrease price by Rp {abs(price_gap):,}"
        )

    else:

        recommendation = (
            "Current price is optimal"
        )

    current_price = (
        price.data[
            "sale_price"
        ]
    )

    return {

        "analysis_type":
            "existing_product",

        "product_name":
            product.data["product_name"],
        
        "pricing_method":
            "Market Median + Minimum 30% Margin",

        "base_price":
            base_price,

        "current_price":
            current_price,

        "recommended_price":
            recommended_price,

        "average_market_price":
            round(market_price),

        "lowest_market_price":
            int(
                benchmark[
                    "Harga (IDR)"
                ].min()
            ),

        "highest_market_price":
            int(
                benchmark[
                    "Harga (IDR)"
                ].max()
            ),

        "expected_margin":
            expected_margin,

        "margin_percentage":
            margin_percentage,

        "price_gap":
            price_gap,

        "recommendation":
            recommendation,

        "price_position":
            get_price_position(
                current_price,
                market_price
            ),

        "similar_products":

            benchmark[
                [
                    "Nama Produk",
                    "Harga (IDR)",
                    "similarity"
                ]
            ]
            .rename(
                columns={
                    "Nama Produk":
                        "product_name",
                    "Harga (IDR)":
                        "price"
                }
            )
            .to_dict(
                orient="records"
            )
    }

# ==================================================
# NEW PRODUCT PRICE RECOMMENDATION
# ==================================================

def recommend_price(
    payload:
    ProductPriceRecommendationRequest
):

    benchmark = (
        get_similar_market_products(
            payload.product_name
        )
    )

    prices = benchmark["Harga (IDR)"]

    q1 = prices.quantile(0.25)
    q3 = prices.quantile(0.75)

    iqr = q3 - q1

    filtered_prices = prices[
        (prices >= q1 - 1.5 * iqr)
        &
        (prices <= q3 + 1.5 * iqr)
    ]

    market_price = (
        filtered_prices
        .median()
    )

    target_margin = 0.30

    cost_based_price = (
        payload.base_price *
        (1 + target_margin)
    )
    recommended_price = round(
        max(
            market_price,
            cost_based_price
        )
    )
    expected_margin = (
        recommended_price -
        payload.base_price
    )

    margin_percentage = round(
        (
            expected_margin /
            payload.base_price
        ) * 100,
        2
    )

    return {

        "analysis_type":
            "new_product",

        "product_name":
            payload.product_name,
        
        "pricing_method":
            "Market Median + Minimum 30% Margin",

        "base_price":
            payload.base_price,

        "recommended_price":
            recommended_price,

        "average_market_price":
            round(market_price),

        "lowest_market_price":
            int(
                benchmark[
                    "Harga (IDR)"
                ].min()
            ),

        "highest_market_price":
            int(
                benchmark[
                    "Harga (IDR)"
                ].max()
            ),

        "expected_margin":
            expected_margin,

        "margin_percentage":
            margin_percentage,

        "similar_products":

            benchmark[
                [
                    "Nama Produk",
                    "Harga (IDR)",
                    "similarity"
                ]
            ]
            .rename(
                columns={
                    "Nama Produk":
                        "product_name",
                    "Harga (IDR)":
                        "price"
                }
            )
            .to_dict(
                orient="records"
            )
    }