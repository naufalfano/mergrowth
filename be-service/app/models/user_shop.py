from pydantic import BaseModel


class CreateShopRequest(BaseModel):
    shop_name: str
    location: str
    category: str


class ShopResponse(BaseModel):
    id: str
    user_id: str
    shop_name: str
    location: str
    category: str
