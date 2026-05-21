from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import face_recognition
import cv2
import numpy as np
import os
import base64
import state



app = FastAPI(title="Student Attendance API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Vite dev server
        "http://127.0.0.1:5173",
        "https://localhost:5173",
        "https://172.20.10.2:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FORCE_RETRAIN = True

DATASET_DIR = r"D:\major_proj\backend\OpenCV Demo\dataset"
encoding_file = "encodings.pkl"


# ──────────────────────────────────────────────────────────────────────────
# TRAINING / GENERATION LOGIC
# ──────────────────────────────────────────────────────────────────────────
def train_model():
    if not os.path.exists(DATASET_DIR):
        print(f"Dataset directory {DATASET_DIR} does not exist.")
        return
    local_encodings = []
    local_ids = []

    for student_id in os.listdir(DATASET_DIR):
        student_folder = os.path.join(DATASET_DIR, student_id)
        if not os.path.isdir(student_folder):
            continue

        for file in os.listdir(student_folder):
            img_path = os.path.join(student_folder, file)

            img_bgr = cv2.imread(img_path)
            if img_bgr is None:
                continue

            h, w = img_bgr.shape[:2]
            # Resize aggressively before any processing (GPU OOM fix)
            if w > 400:
                scale = 400 / w
                img_bgr = cv2.resize(img_bgr, (400, int(h * scale)))

            rgb_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            # model="hog" → CPU only, avoids GPU memory errors
            face_locations = face_recognition.face_locations(rgb_img, model="hog")
            encodings = face_recognition.face_encodings(rgb_img, face_locations)

            if encodings:
                local_encodings.append(encodings[0])
                local_ids.append(student_id)
                print(f"[OK] {file} → {student_id}")
            else:
                print(f"[SKIP] No face in {file}")

    print(f"Saving {len(local_ids)} faces to {encoding_file}")
    with open(encoding_file, "wb") as f:
        pickle.dump({"encodings": local_encodings, "ids": local_ids}, f)
    print("Encodings saved!")


def load_encodings():
    if FORCE_RETRAIN:
        print(">>> FORCE RETRAIN is enabled. Training model from dataset...")
        train_model()
    elif not os.path.exists(encoding_file):
        print(">>> No encoding file found. Training model from dataset...")
        train_model()

    if os.path.exists(encoding_file):
        print(f"Startup(loading encodings from {encoding_file})")
        try:
            with open(encoding_file, "rb") as f:
                data = pickle.load(f)
                state.known_encodings = data["encodings"]
                state.known_ids = data["ids"]
            print(f"Loaded {len(state.known_ids)} student profiles.")
        except Exception as e:
            print(f"Error loading encodings: {e}")
    else:
        print("failed to call or generate encodings.")


# Call on startup
load_encodings()


# ──────────────────────────────────────────────────────────────────────────
# CORE RECOGNITION FUNCTION (shared by hardware endpoint + existing routers)
# ──────────────────────────────────────────────────────────────────────────
def process_face_recognition(image_bytes: bytes) -> int:
    if not image_bytes:
        return None

    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_bgr is None:
        print("Error: Unable to decode image")
        return None

    h, w = img_bgr.shape[:2]
    if w > 400:
        scale = 400 / w
        img_bgr = cv2.resize(img_bgr, (400, int(h * scale)))

    rgb_img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # model="hog" → CPU only, avoids GPU memory errors
    face_locations = face_recognition.face_locations(rgb_img, model="hog")
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)

    if not face_encodings:
        print("No faces found in the image.")
        return None

    matches = face_recognition.compare_faces(
        state.known_encodings, face_encodings[0], tolerance=0.6
    )
    face_distances = face_recognition.face_distance(
        state.known_encodings, face_encodings[0]
    )

    best_match_index = np.argmin(face_distances)
    if matches[best_match_index]:
        recognized_id_str = state.known_ids[best_match_index]
        print(f"Recognized ID: {recognized_id_str}")
        try:
            return int(recognized_id_str)
        except ValueError:
            print("Error: Recognized ID is not a valid integer.")
            return None

    return None


# ──────────────────────────────────────────────────────────────────────────
# HARDWARE CLIENT ENDPOINT
# Receives base64-encoded JPEG frames from hardware_client.py over HTTPS
# ──────────────────────────────────────────────────────────────────────────
class FrameRequest(BaseModel):
    image: str          # base64-encoded JPEG from hardware_client.py
    tolerance: float = 0.6


@app.post("/recognize")
async def recognize_from_hardware(req: FrameRequest):
    """
    Called by hardware_client.py every FRAME_INTERVAL seconds.
    Decodes the base64 image, runs face recognition, returns the result.
    """
    try:
        image_bytes = base64.b64decode(req.image)
    except Exception:
        return {
            "faces_found": 0,
            "names": [],
            "name": "Unknown",
            "error": "Invalid base64 data",
        }

    student_id = process_face_recognition(image_bytes)

    if student_id is not None:
        return {
            "faces_found": 1,
            "name": str(student_id),
            "student_id": student_id,
        }
    else:
        return {
            "faces_found": 0,
            "name": "Unknown",
            "student_id": None,
        }


# ──────────────────────────────────────────────────────────────────────────
# EXISTING ROUTERS (unchanged)
# ──────────────────────────────────────────────────────────────────────────
from routers import auth, users, students, faculty, parents, admin, recognition

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(students.router)
app.include_router(faculty.router)
app.include_router(parents.router)
app.include_router(admin.router)
app.include_router(recognition.router)


@app.get("/")
def home():
    return {"message": "System is running"}
