import datetime
from fastapi import APIRouter, Depends
from app.auth.auth_handler import get_current_user_token
from app.database.connection import get_collection

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
async def get_user_notifications(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    col = get_collection("notifications")
    
    # Fetch notifications from DB
    notifications = await col.find({"user_id": user_id}).sort("timestamp", -1).to_list(length=50)
    
    # If no notifications exist, return fallback wellness reminders
    if not notifications:
        now = datetime.datetime.utcnow()
        notifications = [
            {
                "id": "n1",
                "title": "Daily Mood Check-in",
                "description": "It's time to check in! Log how you are feeling to maintain your streak.",
                "type": "reminder",
                "read": False,
                "createdAt": (now - datetime.timedelta(hours=1)).isoformat() + "Z"
            },
            {
                "id": "n2",
                "title": "Mindfulness Meditation",
                "description": "Unwind with a short 5-minute breathing exercise to decrease stress.",
                "type": "meditation",
                "read": False,
                "createdAt": (now - datetime.timedelta(hours=4)).isoformat() + "Z"
            },
            {
                "id": "n3",
                "title": "Journal Reflection Ready",
                "description": "Reflect on your day. Log a journal entry to unlock weekly AI emotional trends.",
                "type": "journal",
                "read": True,
                "createdAt": (now - datetime.timedelta(days=1)).isoformat() + "Z"
            }
        ]
    else:
        for n in notifications:
            n["id"] = str(n["_id"])
            del n["_id"]
            
    return notifications
