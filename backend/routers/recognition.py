from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from datetime import datetime, date

from dbz import get_db
import modelz
import schemas
import main

router = APIRouter(prefix="/api", tags=["Face Recognition"])


@router.post("/recognition/upload", response_model=schemas.AttendanceResponse)
async def mark_attendance(
    room_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    now = datetime.now()

    # ── Schedule lookup with overlap detection ──────────────────────────────
    matched_schedules = db.execute(
        select(modelz.ClassSchedules).where(
            and_(
                modelz.ClassSchedules.room_identifier == room_id,
                modelz.ClassSchedules.day_of_week == now.strftime("%a"),
                modelz.ClassSchedules.start_time <= now.time(),
                modelz.ClassSchedules.end_time >= now.time()
            )
        )
    ).scalars().all()

    if not matched_schedules:
        raise HTTPException(status_code=404, detail="No active schedule found for this room.")

    if len(matched_schedules) > 1:
        overlap_info = [
            f"schedule_id={s.schedule_id} ({s.start_time}–{s.end_time})"
            for s in matched_schedules
        ]
        raise HTTPException(
            status_code=409,
            detail=f"Multiple overlapping schedules found for room '{room_id}': {', '.join(overlap_info)}. "
                   f"Please fix duplicate schedules in the database."
        )

    schedule = matched_schedules[0]
    # ────────────────────────────────────────────────────────────────────────

    recognized_user_id = main.process_face_recognition(await file.read())
    if not recognized_user_id:
        raise HTTPException(status_code=400, detail="Face not recognized.")

    # Convert user_id (folder name) to actual student_id
    student = db.execute(
        select(modelz.Students)
        .where(modelz.Students.student_id== recognized_user_id)
    ).scalars().first()

    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found for recognized face.")

    student_id = student.student_id

    enrolled = db.execute(
        select(modelz.Enrollments).where(
            and_(
                modelz.Enrollments.student_id == student_id,
                modelz.Enrollments.class_id == schedule.class_id
            )
        )
    ).scalar_one_or_none()
    if not enrolled:
        raise HTTPException(status_code=403, detail="Student not enrolled in this class.")

    today = date.today()
    existing = db.execute(
        select(modelz.AttendanceRecords).where(
            and_(
                modelz.AttendanceRecords.student_id == student_id,
                modelz.AttendanceRecords.schedule_id == schedule.schedule_id,
                modelz.AttendanceRecords.attend_date == today
            )
        )
    ).scalar_one_or_none()

    if existing:
        return {
            "status": "duplicate",
            "student_id": student_id,
            "schedule_id": schedule.schedule_id,
            "recorded_at": existing.recorded_at,
            "message": "Attendance already marked for today."
        }

    new_record = modelz.AttendanceRecords(
        student_id=student_id,
        schedule_id=schedule.schedule_id,
        attend_date=today,
        recorded_at=datetime.now(),
        status="present"
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return {
        "status": "success",
        "student_id": student_id,
        "schedule_id": schedule.schedule_id,
        "recorded_at": new_record.recorded_at,
        "message": "Attendance marked successfully."
    }