from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str            # service_role key from Supabase dashboard
    supabase_anon_key: str      # anon/public key from Supabase dashboard
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_origins: List[str] = ["http://localhost:5173"]
    ml_service_url: str = "http://localhost:8001"

    class Config:
        env_file = ".env"


settings = Settings()
