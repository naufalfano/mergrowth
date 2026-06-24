from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.service.supabase import supabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        res = supabase.auth.get_user(token)
        if not res.user:
            raise credentials_exception
        return {"user_id": str(res.user.id), "token": token}
    except Exception:
        raise credentials_exception
