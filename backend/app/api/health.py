from fastapi import APIRouter
from app.database.connection import Database
from app.config.settings import settings
from app.services import emotion_service, gemini_service

router = APIRouter(prefix="/api/health", tags=["Health Check"])

@router.get("")
async def health_check():
    # 1. MongoDB Status
    mongodb_status = "offline"
    if Database.client is not None:
        try:
            # Ping database
            await Database.client.admin.command('ping')
            mongodb_status = "online"
        except Exception:
            pass

    # 2. Gemini Status
    gemini_status = "offline (key missing)"
    if settings.GOOGLE_API_KEY:
        gemini_status = "online"

    # 3. GoEmotions Status
    goemotions_status = "offline"
    if emotion_service.classifier is not None:
        goemotions_status = "online"
    else:
        goemotions_status = "online (api/rule-based fallback active)"

    return {
        "status": "up",
        "mongodb": mongodb_status,
        "gemini": gemini_status,
        "goemotions": goemotions_status
    }
