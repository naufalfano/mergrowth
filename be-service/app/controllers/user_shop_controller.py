from fastapi import HTTPException, status

from app.service.supabase import supabase
from app.models.user_shop import CreateShopRequest


def create_shop(user_id: str, payload: CreateShopRequest) -> dict:
    res = (
        supabase.table("user_shop")
        .insert({
            "user_id":   user_id,
            "shop_name": payload.shop_name,
            "location":  payload.location,
            "category":  payload.category,
        })
        .execute()
    )
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create shop",
        )
    return res.data[0]


def get_shop(user_id: str) -> dict | None:
    res = (
        supabase.table("user_shop")
        .select("*")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    return res.data
