from fastapi import APIRouter, Depends
from app.auth.auth_handler import get_current_user_token
from app.repositories.history_repository import HistoryRepository

router = APIRouter(prefix="/api/history", tags=["History Analytics"])

@router.get("")
async def get_history_summary(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # 1. Fetch mood logs
    moods = await HistoryRepository.get_mood_history(user_id, limit=30)
    
    # 2. Fetch completed activities
    activities = await HistoryRepository.get_activity_history(user_id, limit=30)
    
    return {
        "mood_history": moods,
        "activity_history": activities
    }
