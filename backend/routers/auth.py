from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext

from dbz import get_db
import modelz
import schemas
from dependencies import (
    create_access_token,
    create_reset_token,
    verify_reset_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(modelz.Users).where(modelz.Users.email == payload.email)
    ).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": str(user.user_id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout(_: modelz.Users = Depends(get_current_user)):
    # JWT is stateless — logout is handled client-side by discarding the token.
    return {"message": "Logged out successfully. Please discard your token."}


@router.post("/forgotpassword")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(modelz.Users).where(modelz.Users.email == payload.email)
    ).scalar_one_or_none()

    # Always return the same message to prevent email enumeration attacks
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    reset_token = create_reset_token(user.user_id)

    # TODO: Replace with actual email delivery (SendGrid/SMTP) in production
    return {"message": "Password reset token generated.", "reset_token": reset_token}


@router.post("/resetpassword")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user_id = verify_reset_token(payload.token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )

    user = db.execute(
        select(modelz.Users).where(modelz.Users.user_id == user_id)
    ).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully."}