from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from dbz import get_db
import modelz
import schemas
from dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserMeResponse)
def get_me(
    current_user: modelz.Users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roles = [r.role_name for r in current_user.role]
    profile = {}

    # Each block is an independent if — not elif.
    # This ensures ALL profiles are fetched for users with multiple roles.
    # Students will only ever hit the first block since student is an exclusive role.
    # Faculty/parent/admin users may hit multiple blocks.

    if "student" in roles:
        student = db.execute(
            select(modelz.Students).where(modelz.Students.user_id == current_user.user_id)
        ).scalar_one_or_none()
        if student:
            profile["student"] = {
                "student_id": student.student_id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "curr_semester": student.curr_semester,
            }

    if "faculty" in roles:
        teacher = db.execute(
            select(modelz.Teachers).where(modelz.Teachers.user_id == current_user.user_id)
        ).scalar_one_or_none()
        if teacher:
            profile["faculty"] = {
                "teacher_id": teacher.teacher_id,
                "first_name": teacher.first_name,
                "last_name": teacher.last_name,
                "department": teacher.department,
            }

    if "parent" in roles:
        parent = db.execute(
            select(modelz.Parents).where(modelz.Parents.user_id == current_user.user_id)
        ).scalar_one_or_none()
        if parent:
            profile["parent"] = {
                "parent_id": parent.parent_id,
                "first_name": parent.first_name,
                "last_name": parent.last_name,
                "phone_number": parent.phone_number,
            }

    if "admin" in roles:
        admin = db.execute(
            select(modelz.Admins).where(modelz.Admins.user_id == current_user.user_id)
        ).scalar_one_or_none()
        if admin:
            profile["admin"] = {
                "admin_id": admin.admin_id,
                "first_name": admin.first_name,
                "last_name": admin.last_name,
                "job_title": admin.job_title,
            }

    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "roles": roles,
        "profile": profile,
    }