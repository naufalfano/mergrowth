from fastapi import HTTPException, status

from app.service.supabase import supabase
from app.models.product import (
    ProductCreateRequest,
    ProductResponse
)


def create_product(payload: ProductCreateRequest):

    try:
        product_res = (
            supabase.table("product")
            .insert({
                "product_name": payload.product_name,
                "description": payload.description,
                "category": payload.category,
                "current_stock": payload.current_stock,
            })
            .execute()
        )

        product = product_res.data[0]

        (
            supabase.table("product_price")
            .insert({
                "product_id": product["product_id"],
                "base_price": payload.base_price,
                "sale_price": payload.sale_price,
            })
            .execute()
        )

        return {
            "product_id": product["product_id"],
            "product_name": product["product_name"],
            "description": product["description"],
            "category": product["category"],
            "current_stock": product["current_stock"],
            "base_price": payload.base_price,
            "sale_price": payload.sale_price,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

def get_products():

    try:

        products = (
            supabase.table("product")
            .select(
                """
                product_id,
                product_name,
                description,
                category,
                current_stock
                """
            )
            .execute()
        )

        result = []

        for product in products.data:
            price = (
                supabase.table("product_price")
                .select("base_price, sale_price")
                .eq("product_id", product["product_id"])
                .limit(1)
                .execute()
            )

            price_data = (
                price.data[0]
                if price.data
                else {
                    "base_price": 0,
                    "sale_price": 0,
                }
            )
            result.append({
                **product,
                "base_price": price_data["base_price"],
                "sale_price": price_data["sale_price"],
            })

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
def get_product(product_id: int):

    try:
        product = (
            supabase.table("product")
            .select("*")
            .eq("product_id", product_id)
            .single()
            .execute()
        )

        price = (
            supabase.table("product_price")
            .select("*")
            .eq("product_id", product_id)
            .single()
            .execute()
        )

        return {
            **product.data,
            "base_price": price.data["base_price"],
            "sale_price": price.data["sale_price"],
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

def update_product(
    product_id: int,
    payload: ProductCreateRequest
):

    try:

        (
            supabase.table("product")
            .update({
                "product_name": payload.product_name,
                "description": payload.description,
                "category": payload.category,
                "current_stock": payload.current_stock,
            })
            .eq("product_id", product_id)
            .execute()
        )

        (
            supabase.table("product_price")
            .update({
                "base_price": payload.base_price,
                "sale_price": payload.sale_price,
            })
            .eq("product_id", product_id)
            .execute()
        )

        return {"id": product_id}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

def delete_product(product_id: int):

    try:

        (
            supabase.table("product_price")
            .delete()
            .eq("product_id", product_id)
            .execute()
        )

        (
            supabase.table("product")
            .delete()
            .eq("product_id", product_id)
            .execute()
        )

        return None

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
def import_products(products):

    try:

        for product in products:

            product_res = (
                supabase.table("product")
                .insert({
                    "product_name": product.product_name,
                    "description": product.description,
                    "category": product.category,
                    "current_stock": product.current_stock,
                })
                .execute()
            )

            product_id = product_res.data[0]["id"]

            (
                supabase.table("product_price")
                .insert({
                    "product_id": product_id,
                    "base_price": product.base_price,
                    "sale_price": product.sale_price,
                })
                .execute()
            )

        return {
            "total_imported": len(products)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )