from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import select
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os

from dbz import get_db
import modelz

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Token Helpers ─────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_reset_token(user_id: int) -> str:
    data = {"sub": str(user_id), "type": "reset"}
    return create_access_token(data, expires_delta=timedelta(minutes=15))


def verify_reset_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
            return None
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except JWTError:
        return None


# ── Current User ──────────────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> modelz.Users:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.execute(
        select(modelz.Users).where(modelz.Users.user_id == int(user_id))
    ).scalar_one_or_none()

    if user is None:
        raise credentials_exception
    return user


# ── Role Guard Factory ────────────────────────────────────────────────────────
# require_role("faculty", "admin") means user must have AT LEAST ONE of those roles.

def require_role(*roles: str):
    def role_checker(current_user: modelz.Users = Depends(get_current_user)) -> modelz.Users:
        user_roles = [r.role_name for r in current_user.role]
        if not any(r in user_roles for r in roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted. Required role(s): {', '.join(roles)}"
            )
        return current_user
    return role_checker


# ── Convenience Role Dependencies ─────────────────────────────────────────────

require_student = require_role("student")
require_faculty = require_role("faculty")
require_parent  = require_role("parent")
require_admin   = require_role("admin")


# ── Profile Resolvers ─────────────────────────────────────────────────────────

def get_student_profile(
    current_user: modelz.Users = Depends(require_student),
    db: Session = Depends(get_db)
) -> modelz.Students:
    student = db.execute(
        select(modelz.Students).where(modelz.Students.user_id == current_user.user_id)
    ).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return student


def get_faculty_profile(
    current_user: modelz.Users = Depends(require_faculty),
    db: Session = Depends(get_db)
) -> modelz.Teachers:
    teacher = db.execute(
        select(modelz.Teachers).where(modelz.Teachers.user_id == current_user.user_id)
    ).scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")
    return teacher


def get_parent_profile(
    current_user: modelz.Users = Depends(require_parent),
    db: Session = Depends(get_db)
) -> modelz.Parents:
    parent = db.execute(
        select(modelz.Parents).where(modelz.Parents.user_id == current_user.user_id)
    ).scalar_one_or_none()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found.")
    return parent