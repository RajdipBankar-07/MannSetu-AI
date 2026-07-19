import datetime
from bson import ObjectId
from typing import List, Optional
from app.database.connection import get_collection

class CommunityRepository:
    @classmethod
    async def create_post(cls, author_name: str, content: str, mood_tag: Optional[str] = None) -> dict:
        col = get_collection("community_posts")
        doc = {
            "author": author_name or "Anonymous Peer",
            "content": content,
            "mood_tag": mood_tag,
            "likes_count": 0,
            "likes_users": [],
            "comments_count": 0,
            "reports_count": 0,
            "reported": False,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        res = await col.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        if "_id" in doc:
            del doc["_id"]
        return doc

    @classmethod
    async def get_active_posts(cls, limit: int = 50) -> List[dict]:
        col = get_collection("community_posts")
        cursor = col.find({"reported": {"$ne": True}}).sort("timestamp", -1)
        posts = await cursor.to_list(length=limit)
        for p in posts:
            p["id"] = str(p["_id"])
            del p["_id"]
        return posts

    @classmethod
    async def toggle_like(cls, post_id: str, user_id: str) -> bool:
        col = get_collection("community_posts")
        try:
            query = {"_id": ObjectId(post_id)}
        except Exception:
            query = {"_id": post_id}

        post = await col.find_one(query)
        if not post:
            return False

        users_liked = post.get("likes_users", [])
        if user_id in users_liked:
            # Unlike
            users_liked.remove(user_id)
            await col.update_one(query, {
                "$set": {"likes_users": users_liked},
                "$inc": {"likes_count": -1}
            })
            return False
        else:
            # Like
            users_liked.append(user_id)
            await col.update_one(query, {
                "$set": {"likes_users": users_liked},
                "$inc": {"likes_count": 1}
            })
            return True

    @classmethod
    async def add_comment(cls, post_id: str, author_name: str, text: str) -> dict:
        col = get_collection("comments")
        doc = {
            "post_id": post_id,
            "author": author_name or "Anonymous Peer",
            "content": text,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        res = await col.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        if "_id" in doc:
            del doc["_id"]

        # Increment comments count on post
        posts_col = get_collection("community_posts")
        try:
            query = {"_id": ObjectId(post_id)}
        except Exception:
            query = {"_id": post_id}
        await posts_col.update_one(query, {"$inc": {"comments_count": 1}})

        return doc

    @classmethod
    async def get_comments_for_post(cls, post_id: str) -> List[dict]:
        col = get_collection("comments")
        cursor = col.find({"post_id": post_id}).sort("timestamp", 1)
        comments = await cursor.to_list(length=100)
        for c in comments:
            c["id"] = str(c["_id"])
            del c["_id"]
        return comments

    @classmethod
    async def report_post(cls, post_id: str) -> bool:
        col = get_collection("community_posts")
        try:
            query = {"_id": ObjectId(post_id)}
        except Exception:
            query = {"_id": post_id}
        res = await col.update_one(query, {
            "$set": {"reported": True},
            "$inc": {"reports_count": 1}
        })
        return res.modified_count > 0
