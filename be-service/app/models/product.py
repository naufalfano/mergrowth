from pydantic import BaseModel


class ProductCreateRequest(BaseModel):
    product_name: str
    description: str | None = None
    category: str
    current_stock: int

    base_price: int
    sale_price: int


class ProductResponse(BaseModel):
    id: int

    product_name: str
    description: str | None
    category: str

    current_stock: int

    base_price: int
    sale_price: int