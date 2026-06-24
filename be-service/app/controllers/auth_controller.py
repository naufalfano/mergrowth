from fastapi import HTTPException, status
from app.service.supabase import supabase
from app.models.auth import SignUpRequest, SignInRequest, AuthResponse


def sign_up(payload: SignUpRequest) -> AuthResponse:
    try:
        res = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
            "options": {"data": {"full_name": payload.full_name}},
        })
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    if not res.user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sign up failed")

    if not res.session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please check your email to confirm your account before signing in.",
        )

    profile = (
        supabase.table("user_acc")
        .select("full_name, role, onboarding_completed")
        .eq("id", res.user.id)
        .single()
        .execute()
    )

    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user_id=str(res.user.id),
        email=res.user.email,
        full_name=profile.data.get("full_name") if profile.data else payload.full_name,
        role=profile.data.get("role") if profile.data else "user",
        onboarding_completed=profile.data.get("onboarding_completed", False) if profile.data else False,
    )


def sign_in(payload: SignInRequest) -> AuthResponse:
    try:
        res = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password,
        })
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not res.user or not res.session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    profile = (
        supabase.table("user_acc")
        .select("full_name, role, onboarding_completed")
        .eq("id", res.user.id)
        .single()
        .execute()
    )

    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user_id=str(res.user.id),
        email=res.user.email,
        full_name=profile.data.get("full_name"),
        role=profile.data.get("role"),
        onboarding_completed=profile.data.get("onboarding_completed", False),
    )


def sign_out(token: str) -> None:
    try:
        supabase.auth.sign_out()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


def complete_onboarding(user_id: str) -> None:
    supabase.table("user_acc").update(
        {"onboarding_completed": True}
    ).eq("id", user_id).execute()
