from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    mongodb_uri: str = Field(...)
    mongodb_db: str = "face_verifier"
    face_collection: str = "face_embeddings"

    model_name: str = Field("Facenet", alias="FACE_MODEL_NAME")
    detector_backend: str = Field("mtcnn", alias="FACE_DETECTOR_BACKEND")
    threshold: float = Field(0.6, alias="FACE_MATCH_THRESHOLD")

    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True
        extra = "ignore" 


settings = Settings()