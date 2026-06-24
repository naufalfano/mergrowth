from fastapi import APIRouter
from fastapi import Query

from app.models.common import ApiResponse
from app.models.product import (
    ProductCreateRequest,
    ProductResponse,
    BulkProductImportRequest
)

from app.controllers import product_controller

router = APIRouter(
    prefix="/products",
    tags=["products"]
)


@router.post(
    "",
    response_model=ApiResponse[ProductResponse]
)
def create_product(
    payload: ProductCreateRequest
):
    data = product_controller.create_product(payload)

    return ApiResponse(
        success=True,
        message="Product created successfully",
        data=data,
    )

@router.get("")
def get_products(
    page: int = Query(1),
    page_size: int = Query(10)
):

    data = product_controller.get_products(
        page,
        page_size
    )

    return ApiResponse(
        success=True,
        message="Products retrieved successfully",
        data=data
    )

@router.get("/{product_id}")
def get_product(product_id: int):

    data = product_controller.get_product(product_id)

    return ApiResponse(
        success=True,
        message="Product retrieved successfully",
        data=data
    )

@router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductCreateRequest
):

    data = product_controller.update_product(
        product_id,
        payload
    )

    return ApiResponse(
        success=True,
        message="Product updated successfully",
        data=data
    )

@router.delete("/{product_id}")
def delete_product(product_id: int):

    product_controller.delete_product(product_id)

    return ApiResponse(
        success=True,
        message="Product deleted successfully",
        data=None
    )

@router.post("/import")
def import_products(
    payload: BulkProductImportRequest
):

    data = product_controller.import_products(
        payload.products
    )

    return ApiResponse(
        success=True,
        message="Products imported successfully",
        data=data
    )