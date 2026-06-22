from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.auth import SignUpRequest, SignInRequest, AuthResponse
from app.models.common import ApiResponse
from app.controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=ApiResponse[AuthResponse])
def signup(payload: SignUpRequest):
    data = auth_controller.sign_up(payload)
    return ApiResponse(success=True, message="Account created successfully", data=data)


@router.post("/signin", response_model=ApiResponse[AuthResponse])
def signin(payload: SignInRequest):
    data = auth_controller.sign_in(payload)
    return ApiResponse(success=True, message="Signed in successfully", data=data)


@router.post("/signout", response_model=ApiResponse[None])
def signout(current_user: dict = Depends(get_current_user)):
    auth_controller.sign_out(current_user["token"])
    return ApiResponse(success=True, message="Signed out successfully")
