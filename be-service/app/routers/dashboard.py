from fastapi import APIRouter, Query

from app.models.common import ApiResponse
from app.models.transaction import *

from app.controllers import dashboard_controller

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/revenue")
def revenue(
    groupBy: RevenueType,
    year: int | None = None,
    month: int | None = None
):
    return dashboard_controller.revenue(
        groupBy=groupBy.value,
        year=year,
        month=month
    )

@router.get("/sales")
def sales(
    groupBy: SalesType,
    year: int | None = None,
    month: int | None = None
):
    return dashboard_controller.sales(
        groupBy=groupBy.value,
        year=year,
        month=month
    )

@router.get("/nett")
def nett(
    groupBy: str,
    year: int | None = None,
    month: int | None = None
):
    return dashboard_controller.nett(
        groupBy=groupBy,
        year=year,
        month=month
    )

@router.get("/association")
def association(
    level: int = 1
):
    return dashboard_controller.association_top(
        level=level
    )

