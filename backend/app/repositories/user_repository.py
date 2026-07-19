from bson import ObjectId
from typing import Optional
from app.database.connection import get_collection

class UserRepository:
    @staticmethod
    def _get_query(user_id: str) -> dict:
        try:
            return {"_id": ObjectId(user_id)}
        except Exception:
            return {"_id": user_id}

    @classmethod
    async def get_by_id(cls, user_id: str) -> Optional[dict]:
        users_col = get_collection("users")
        user = await users_col.find_one(cls._get_query(user_id))
        if user:
            user["id"] = str(user["_id"])
            if "_id" in user:
                del user["_id"]
        return user

    @classmethod
    async def get_by_email(cls, email: str) -> Optional[dict]:
        users_col = get_collection("users")
        user = await users_col.find_one({"email": email})
        if user:
            user["id"] = str(user["_id"])
        return user

    @classmethod
    async def create(cls, user_doc: dict) -> dict:
        users_col = get_collection("users")
        res = await users_col.insert_one(user_doc)
        user_doc["id"] = str(res.inserted_id)
        if "_id" in user_doc:
            del user_doc["_id"]
        return user_doc

    @classmethod
    async def update(cls, user_id: str, updates: dict) -> bool:
        users_col = get_collection("users")
        res = await users_col.update_one(cls._get_query(user_id), {"$set": updates})
        return res.modified_count > 0
