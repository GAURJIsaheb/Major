from typing import Dict

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import settings
from app.database import ensure_indexes
from app.face_service import (
    build_embedding_from_image,
    upsert_employee_embedding,
    verify_embedding,
)

app = FastAPI(
    title="Face Verification Service",
    version="1.0",
    description="FastAPI wrapper around DeepFace (Facenet) for 1:1 verification",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterResponse(BaseModel):
    employeeId: str
    updated: bool


class VerifyResponse(BaseModel):
    match: bool
    confidence: float
    threshold: float


@app.on_event("startup")
async def startup_tasks():
    await ensure_indexes()


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "face-verifier"}


@app.post("/register", response_model=RegisterResponse)
async def register_face(
    employeeId: str = Form(...),
    image: UploadFile = File(...),
):
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image file cannot be empty")

    try:
        embedding = await build_embedding_from_image(image_bytes)
        await upsert_employee_embedding(employeeId, embedding)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to store embedding")

    return RegisterResponse(employeeId=employeeId, updated=True)


@app.post("/verify", response_model=VerifyResponse)
async def verify_face(
    employeeId: str = Form(...),
    image: UploadFile = File(...),
):
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Live image cannot be empty")

    try:
        embedding = await build_embedding_from_image(image_bytes)
        similarity = await verify_embedding(employeeId, embedding)

    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    except Exception as exc:
        print("--- >ACTUAL ERROR:", str(exc))  
        raise HTTPException(status_code=500, detail=str(exc))  

    match = similarity >= settings.threshold

    return VerifyResponse(
        match=match,
        confidence=float(similarity),
        threshold=settings.threshold,
    )