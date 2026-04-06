from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db]
collection = db[settings.face_collection]


async def ensure_indexes() -> None:
    await collection.create_index("employeeId", unique=True)
