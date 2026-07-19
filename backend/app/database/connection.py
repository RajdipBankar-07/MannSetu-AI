import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger("mannsetu.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        try:
            logger.info(f"Connecting to MongoDB at: {settings.MONGODB_URI}")
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            cls.db = cls.client[settings.DATABASE_NAME]
            logger.info(f"Connected to database: {settings.DATABASE_NAME}")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise e

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB database connection closed.")
            cls.client = None
            cls.db = None

def get_db():
    if Database.db is None:
        raise RuntimeError("Database not initialized. Call connect_db first.")
    return Database.db

def get_collection(name: str):
    return get_db()[name]
