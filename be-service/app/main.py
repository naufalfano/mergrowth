from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.service.config import settings
from app.routers import health, auth, product

app = FastAPI(title="Mergrowth API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(product.router, prefix="/api/v1")
