import datetime
from bson import ObjectId
from typing import List
from app.database.connection import get_collection

class HistoryRepository:
    @classmethod
    async def log_mood(cls, user_id: str, mood: int, primary_emotion: str, note: str) -> dict:
        col = get_collection("mood_history")
        doc = {
            "user_id": user_id,
            "mood": mood,
            "primary_emotion": primary_emotion,
            "note": note,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        res = await col.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        if "_id" in doc:
            del doc["_id"]
        return doc

    @classmethod
    async def get_mood_history(cls, user_id: str, limit: int = 30) -> List[dict]:
        col = get_collection("mood_history")
        cursor = col.find({"user_id": user_id}).sort("timestamp", -1)
        history = await cursor.to_list(length=limit)
        for h in history:
            h["id"] = str(h["_id"])
            del h["_id"]
        return history

    @classmethod
    async def log_emotion(cls, user_id: str, text: str, primary_emotion: str, distribution: dict) -> dict:
        col = get_collection("emotion_history")
        doc = {
            "user_id": user_id,
            "text": text,
            "primary_emotion": primary_emotion,
            "emotions_distribution": distribution,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        res = await col.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc

    @classmethod
    async def log_activity(cls, user_id: str, activity_type: str, activity_id: str, duration: int, xp: int, score: int = 0) -> dict:
        col = get_collection("activity_history")
        doc = {
            "user_id": user_id,
            "activity_type": activity_type,
            "activity_id": activity_id,
            "duration_minutes": duration,
            "xp_earned": xp,
            "score": score,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        res = await col.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        if "_id" in doc:
            del doc["_id"]
        return doc

    @classmethod
    async def get_activity_history(cls, user_id: str, limit: int = 30) -> List[dict]:
        col = get_collection("activity_history")
        cursor = col.find({"user_id": user_id}).sort("timestamp", -1)
        history = await cursor.to_list(length=limit)
        for h in history:
            h["id"] = str(h["_id"])
            del h["_id"]
        return history
