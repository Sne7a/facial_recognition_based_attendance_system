from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
import os

from dbz import get_db
import modelz
import schemas
from dependencies import get_student_profile

router = APIRouter(prefix="/api/students", tags=["Students"])

# Profile pictures only — never read by train_model() or encodings.pkl
STUDENT_IMG_DIR = r"D:\major_proj\backend\student_uploads"


@router.get("/me/attendance", response_model=List[schemas.AttendanceSummary])
def get_my_attendance(
    student: modelz.Students = Depends(get_student_profile),
    db: Session = Depends(get_db)
):
    records = db.execute(
        select(modelz.AttendanceRecords, modelz.Subjects)
        .join(modelz.ClassSchedules, modelz.AttendanceRecords.schedule_id == modelz.ClassSchedules.schedule_id)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .where(modelz.AttendanceRecords.student_id == student.student_id)
    ).all()

    subject_map = {}
    for record, subject in records:
        name = subject.subject_name
        if name not in subject_map:
            subject_map[name] = {"total": 0, "present": 0}
        subject_map[name]["total"] += 1
        if record.status == "present":
            subject_map[name]["present"] += 1

    return [
        schemas.AttendanceSummary(
            subject_name=name,
            total_classes=data["total"],
            present=data["present"],
            attendance_percentage=round((data["present"] / data["total"]) * 100, 2) if data["total"] > 0 else 0.0
        )
        for name, data in subject_map.items()
    ]


@router.get("/me/timetable", response_model=List[schemas.TimetableEntry])
def get_my_timetable(
    student: modelz.Students = Depends(get_student_profile),
    db: Session = Depends(get_db)
):
    results = db.execute(
        select(modelz.ClassSchedules, modelz.Subjects, modelz.Teachers)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .join(modelz.Teachers, modelz.Classes.teacher_id == modelz.Teachers.teacher_id)
        .join(modelz.Enrollments, modelz.Enrollments.class_id == modelz.Classes.class_id)
        .where(modelz.Enrollments.student_id == student.student_id)
    ).all()

    return [
        schemas.TimetableEntry(
            schedule_id=schedule.schedule_id,
            subject_name=subject.subject_name,
            day_of_week=schedule.day_of_week,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            room_identifier=schedule.room_identifier,
            teacher_name=f"{teacher.first_name} {teacher.last_name}".strip()
        )
        for schedule, subject, teacher in results
    ]


@router.post("/me/face", response_model=schemas.FaceUploadResponse)
async def upload_face(
    file: UploadFile = File(...),
    student: modelz.Students = Depends(get_student_profile),
    db: Session = Depends(get_db)
):
    """
    Profile picture upload — stored in STUDENT_IMG_DIR and recorded in StudentImages table.
    This is purely for display purposes (portal, reports).
    It does NOT affect face recognition or encodings.pkl.
    For recognition training, admin must use POST /api/admin/students/register
    or POST /api/admin/dataset/add.
    """
    os.makedirs(STUDENT_IMG_DIR, exist_ok=True)
    student_folder = os.path.join(STUDENT_IMG_DIR, str(student.student_id))
    os.makedirs(student_folder, exist_ok=True)

    file_path = os.path.join(student_folder, file.filename)
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    new_image = modelz.StudentImages(student_id=student.student_id, img_path=file_path)
    db.add(new_image)
    db.commit()

    return schemas.FaceUploadResponse(
        message="Profile picture uploaded successfully.",
        student_id=student.student_id,
        img_path=file_path
    )
