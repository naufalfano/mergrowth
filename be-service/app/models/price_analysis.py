from pydantic import BaseModel

class ProductBenchmarkRequest(
    BaseModel
):
    product_id: int

class ProductPriceRecommendationRequest(
    BaseModel
):
    product_name: str
    base_price: float