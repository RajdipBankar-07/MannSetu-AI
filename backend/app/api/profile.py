from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.auth_handler import get_current_user_token
from app.repositories.user_repository import UserRepository
from app.repositories.history_repository import HistoryRepository

router = APIRouter(prefix="/api/profile", tags=["User Profile"])

@router.get("")
@router.post("")
async def get_or_update_profile(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    user = await UserRepository.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Get mood timeline for profile stats
    moods = await HistoryRepository.get_mood_history(user_id, limit=7)
    mood_timeline = []
    for m in moods:
        mood_timeline.append({
            "date": m["timestamp"][:10],
            "mood": m["mood"],
            "emotion": m["primary_emotion"]
        })
        
    return {
        "user": user,
        "achievements": user.get("badges", []),
        "xp": user.get("xp", 0),
        "level": user.get("level", 1),
        "badges": user.get("badges", []),
        "mood_timeline": mood_timeline
    }
