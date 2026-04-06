import asyncio
from datetime import datetime
from typing import List, Optional

import cv2
import numpy as np
from deepface import DeepFace

from app.config import settings
from app.database import collection



def _load_image(image_bytes: bytes) -> np.ndarray:
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Unable to decode the image bytes")
    return image


def _embedding_from_image(image_bytes: bytes) -> List[float]:
    image = _load_image(image_bytes)

    result = DeepFace.represent(
        img_path=image,
        model_name=settings.model_name,
        detector_backend=settings.detector_backend,
        enforce_detection=True,
        align=True,
    )

    embedding = result[0]["embedding"]

    embedding_array = np.asarray(embedding, dtype=np.float32)

    if embedding_array.size == 0:
        raise ValueError("Empty embedding")

    return embedding_array.tolist()


async def build_embedding_from_image(image_bytes: bytes) -> List[float]:
    return await asyncio.to_thread(_embedding_from_image, image_bytes)


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    a_arr = np.asarray(a, dtype=np.float32)
    b_arr = np.asarray(b, dtype=np.float32)

    norm = np.linalg.norm(a_arr) * np.linalg.norm(b_arr)
    if norm == 0:
        return 0.0

    similarity = float(np.dot(a_arr, b_arr) / norm)
    return similarity


async def upsert_employee_embedding(employee_id: str, embedding: List[float]) -> None:
    await collection.update_one(
        {"employeeId": employee_id},
        {
            "$set": {
                "employeeId": employee_id,
                "embedding": embedding,
                "updatedAt": datetime.utcnow(),
            }
        },
        upsert=True,
    )


async def fetch_employee_embedding(employee_id: str) -> Optional[List[float]]:
    doc = await collection.find_one({"employeeId": employee_id}, projection={"embedding": 1})
    if not doc or not doc.get("embedding"):
        return None
    return [float(value) for value in doc["embedding"]]


async def verify_embedding(employee_id: str, live_embedding: List[float]) -> float:
    stored = await fetch_employee_embedding(employee_id)
    if stored is None:
        raise ValueError("No embedding found for employeeId")

    return _cosine_similarity(stored, live_embedding)
