from pydantic import BaseModel
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class SalesType(str, Enum):
    allTime = "allTime"
    yearly = "yearly"
    daily = "daily"

class RevenueType(str, Enum):
    yearly = "yearly"
    daily = "daily"
    
class TransactionCreateRequest(BaseModel):
    total_price: int

class TransactionResponse(BaseModel):
    transaction_id: int
    total_price: int
    created_at: datetime

class TransactionDetailCreateRequest(BaseModel):
    transaction_id: int
    product_id: int
    price: int

class TransactionDetailResponse(BaseModel):
    id: int
    transaction_id: int
    product_id: int
    price: int
    created_at: datetime