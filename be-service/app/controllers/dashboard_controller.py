from fastapi import HTTPException, status
from app.service.supabase import supabase
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
from calendar import monthrange
from collections import OrderedDict, defaultdict
import json

def get_all_transactions(start_dt: str, end_dt: str):
    all_data = []
    page_size = 1000
    offset = 0

    while True:
        batch = (
            supabase.table("transaction")
            .select("total_price, created_at")
            .gte("created_at", start_dt)
            .lte("created_at", end_dt)
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

def get_all_transaction_details(start_dt: str, end_dt: str):
    all_data = []
    page_size = 1000
    offset = 0

    while True:
        batch = (
            supabase.table("transaction_detail")
            .select("product_id, created_at")
            .gte("created_at", start_dt)
            .lte("created_at", end_dt)
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

def get_product_map():
    all_products = []
    page_size = 1000
    offset = 0

    while True:
        batch = (
            supabase.table("product")
            .select("product_id, product_name")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not batch.data:
            break

        all_products.extend(batch.data)

        if len(batch.data) < page_size:
            break

        offset += page_size

    return {
        p["product_id"]: p["product_name"]
        for p in all_products
    }

def get_product_price_map():
    all_data = []
    page_size = 1000
    offset = 0

    while True:
        batch = (
            supabase.table("product_price")
            .select(
                "product_id, base_price, sale_price"
            )
            .range(offset, offset + page_size - 1)
            .execute()
        )

        if not batch.data:
            break

        all_data.extend(batch.data)

        if len(batch.data) < page_size:
            break

        offset += page_size

    return {
        row["product_id"]: {
            "base_price": row["base_price"],
            "sale_price": row["sale_price"]
        }
        for row in all_data
    }

def get_all_transaction_details_all_time():
    all_data = []
    page_size = 1000
    offset = 0

    while True:
        batch = (
            supabase.table("transaction_detail")
            .select("product_id")
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

def revenue(
    groupBy: str,
    year: int | None = None,
    month: int | None = None
):
    try:
        today = date.today()

        if groupBy == "yearly":
            # Last 12 completed months (exclude current month)
            end_month_last_day = today.replace(day=1) - timedelta(days=1)
            start_month_first_day = (
                end_month_last_day.replace(day=1)
                - relativedelta(months=11)
            )
            start_dt = start_month_first_day.strftime("%Y-%m-%dT00:00:00")
            end_dt = end_month_last_day.strftime("%Y-%m-%dT23:59:59")

            transactions = get_all_transactions(start_dt, end_dt)

            result: OrderedDict[str, int] = OrderedDict()

            cursor = start_month_first_day
            end_month_first_day = end_month_last_day.replace(day=1)

            while cursor <= end_month_first_day:
                result[cursor.strftime("%Y-%m")] = 0
                cursor += relativedelta(months=1)

            for tx in transactions:
                key = tx["created_at"][:7]  # YYYY-MM

                if key in result:
                    result[key] += tx["total_price"]

            return {
                "groupBy": "yearly",
                "data": [
                    {
                        "period": k,
                        "revenue": v
                    }
                    for k, v in result.items()
                ]
            }

        elif groupBy == "daily":

            if year is not None and month is not None:
                # Specific month
                start_day = date(year, month, 1)
                _, last = monthrange(year, month)
                end_day = date(year, month, last)

            else:
                # Current month until today
                start_day = today.replace(day=1)
                end_day = today

            start_dt = start_day.strftime("%Y-%m-%dT00:00:00")
            end_dt = end_day.strftime("%Y-%m-%dT23:59:59")

            transactions = get_all_transactions(start_dt, end_dt)

            result: OrderedDict[str, int] = OrderedDict()

            cursor = start_day

            while cursor <= end_day:
                result[cursor.strftime("%Y-%m-%d")] = 0
                cursor += timedelta(days=1)

            for tx in transactions:
                key = tx["created_at"][:10]  # YYYY-MM-DD

                if key in result:
                    result[key] += tx["total_price"]

            return {
                "groupBy": "daily",
                "year": end_day.year,
                "month": end_day.month,
                "data": [
                    {
                        "period": k,
                        "revenue": v
                    }
                    for k, v in result.items()
                ]
            }

        else:
            raise ValueError(
                f"Invalid groupBy '{groupBy}'. Allowed values: yearly, daily."
            )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
def sales(
    groupBy: str,
    year: int | None = None,
    month: int | None = None
):
    try:
        today = date.today()

        if groupBy == "yearly":
            end_month_last_day = (
                today.replace(day=1)
                - timedelta(days=1)
            )
            start_month_first_day = (
                end_month_last_day.replace(day=1)
                - relativedelta(months=11)
            )
            start_dt = start_month_first_day.strftime(
                "%Y-%m-%dT00:00:00"
            )
            end_dt = end_month_last_day.strftime(
                "%Y-%m-%dT23:59:59"
            )

        elif groupBy == "daily":
            if year is not None and month is not None:
                start_day = date(year, month, 1)
                _, last = monthrange(year, month)
                end_day = date(
                    year,
                    month,
                    last
                )
            else:
                start_day = today.replace(day=1)
                end_day = today
            start_dt = start_day.strftime(
                "%Y-%m-%dT00:00:00"
            )
            end_dt = end_day.strftime(
                "%Y-%m-%dT23:59:59"
            )
        
        elif groupBy == "allTime":
            pass

        else:
            raise ValueError(
                f"Invalid groupBy '{groupBy}'. Allowed values: yearly, daily, allTime."
            )

        if groupBy == "allTime":
            rows = get_all_transaction_details_all_time()
        else: 
            rows = get_all_transaction_details(
                start_dt,
                end_dt
            )
        product_map = get_product_map()

        product_counter = defaultdict(int)

        for row in rows:
            product_counter[row["product_id"]] += 1

        top_products = sorted(
            product_counter.items(),
            key=lambda x: x[1],
            reverse=True
        )

        response = {
            "groupBy": groupBy,
            "data": [
                {
                    "product_id": product_id,
                    "product_name": product_map.get(
                        product_id,
                        f"Product {product_id}"
                    ),
                    "sold": sold
                }
                for product_id, sold in top_products
            ]
        }

        if groupBy == "yearly":
            response["start"] = start_month_first_day.strftime("%Y-%m")
            response["end"] = end_month_last_day.strftime("%Y-%m")

        elif groupBy == "daily":
            response["year"] = end_day.year
            response["month"] = end_day.month

        return response

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

def nett(
    groupBy: str,
    year: int | None = None,
    month: int | None = None
):
    try:

        today = date.today()

        if groupBy == "yearly":

            end_month_last_day = (
                today.replace(day=1)
                - timedelta(days=1)
            )

            start_month_first_day = (
                end_month_last_day.replace(day=1)
                - relativedelta(months=11)
            )

            start_dt = start_month_first_day.strftime(
                "%Y-%m-%dT00:00:00"
            )

            end_dt = end_month_last_day.strftime(
                "%Y-%m-%dT23:59:59"
            )

            rows = get_all_transaction_details(
                start_dt,
                end_dt
            )

            result = OrderedDict()

            cursor = start_month_first_day
            end_month_first_day = (
                end_month_last_day.replace(day=1)
            )

            while cursor <= end_month_first_day:
                result[cursor.strftime("%Y-%m")] = {
                    "sold": 0,
                    "total_revenue": 0,
                    "net_profit": 0
                }
                cursor += relativedelta(months=1)

            price_map = get_product_price_map()

            for row in rows:

                period = row["created_at"][:7]
                product_id = row["product_id"]

                if product_id not in price_map:
                    continue

                sale_price = (
                    price_map[product_id]["sale_price"]
                )

                base_price = (
                    price_map[product_id]["base_price"]
                )

                result[period]["sold"] += 1

                result[period]["total_revenue"] += (
                    sale_price
                )

                result[period]["net_profit"] += (
                    sale_price - base_price
                )

            return {
                "groupBy": "yearly",
                "start": start_month_first_day.strftime("%Y-%m"),
                "end": end_month_last_day.strftime("%Y-%m"),
                "data": [
                    {
                        "month": period,
                        "sold": values["sold"],
                        "total_revenue": values["total_revenue"],
                        "net_profit": values["net_profit"]
                    }
                    for period, values in result.items()
                ]
            }

        elif groupBy == "daily":

            if year is not None and month is not None:

                start_day = date(year, month, 1)

                _, last = monthrange(
                    year,
                    month
                )

                end_day = date(
                    year,
                    month,
                    last
                )

            else:

                start_day = today.replace(day=1)
                end_day = today

            start_dt = start_day.strftime(
                "%Y-%m-%dT00:00:00"
            )

            end_dt = end_day.strftime(
                "%Y-%m-%dT23:59:59"
            )

            rows = get_all_transaction_details(
                start_dt,
                end_dt
            )

            result = OrderedDict()

            cursor = start_day

            while cursor <= end_day:
                result[cursor.strftime("%Y-%m-%d")] = {
                    "sold": 0,
                    "total_revenue": 0,
                    "net_profit": 0
                }
                cursor += timedelta(days=1)

            price_map = get_product_price_map()

            for row in rows:

                period = row["created_at"][:10]
                product_id = row["product_id"]

                if product_id not in price_map:
                    continue

                sale_price = (
                    price_map[product_id]["sale_price"]
                )

                base_price = (
                    price_map[product_id]["base_price"]
                )

                result[period]["sold"] += 1

                result[period]["total_revenue"] += (
                    sale_price
                )

                result[period]["net_profit"] += (
                    sale_price - base_price
                )

            return {
                "groupBy": "daily",
                "year": end_day.year,
                "month": end_day.month,
                "data": [
                    {
                        "date": period,
                        "sold": values["sold"],
                        "total_revenue": values["total_revenue"],
                        "net_profit": values["net_profit"]
                    }
                    for period, values in result.items()
                ]
            }

        else:
            raise ValueError(
                f"Invalid groupBy '{groupBy}'. Allowed values: yearly, daily."
            )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
def association_top(level: int = 1):

    if level not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="level must be 1 or 2"
        )

    with open(
        "ml-model/association_rules.json",
        "r",
        encoding="utf-8"
    ) as f:

        rules = json.load(f)

    filtered_rules = []

    for rule in rules:

        antecedent_length = len(
            rule["antecedents"]
        )

        consequent_length = len(
            rule["consequents"]
        )

        # level=1 => A -> B
        if (
            level == 1
            and antecedent_length == 1
            and consequent_length == 1
        ):
            filtered_rules.append(rule)

        # level=2 => A+B -> C
        elif (
            level == 2
            and antecedent_length == 2
            and consequent_length == 1
        ):
            filtered_rules.append(rule)

    filtered_rules = sorted(
        filtered_rules,
        key=lambda x: x["confidence"],
        reverse=True
    )

    result = []

    for rule in filtered_rules:

        result.append(
            {
                "from": rule["antecedents"],
                "to": rule["consequents"],
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

    return {
        "level": level,
        "total_associations": len(result),
        "data": result
    }

