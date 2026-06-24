from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.common import ApiResponse
from app.models.user_shop import CreateShopRequest, ShopResponse
from app.controllers import user_shop_controller

router = APIRouter(prefix="/shop", tags=["shop"])


@router.post("", response_model=ApiResponse[ShopResponse])
def create_shop(
    payload: CreateShopRequest,
    current_user: dict = Depends(get_current_user),
):
    data = user_shop_controller.create_shop(current_user["user_id"], payload)
    return ApiResponse(success=True, message="Shop created successfully", data=data)


@router.get("", response_model=ApiResponse[ShopResponse])
def get_shop(current_user: dict = Depends(get_current_user)):
    data = user_shop_controller.get_shop(current_user["user_id"])
    return ApiResponse(success=True, message="Shop retrieved", data=data)
