import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from app.auth.auth_handler import get_current_user_token
from app.repositories.history_repository import HistoryRepository
from app.services.wellness_service import calculate_user_wellness_score, add_xp_and_evaluate_rewards
from app.database.connection import get_collection

router = APIRouter(tags=["Guided Meditations"])

# Static list of meditations
MEDITATIONS_LIST = [
    {"id": "med_1", "name": "4-7-8 Breathing", "category": "Breathing", "duration": "8 min", "level": "Beginner", "description": "Calming breath pattern for anxiety relief.", "xp_reward": 50},
    {"id": "med_2", "name": "Deep Body Scan", "category": "Mindfulness", "duration": "10 min", "level": "Beginner", "description": "Start your day with full body awareness.", "xp_reward": 60},
    {"id": "med_3", "name": "Sleep Preparation", "category": "Sleep", "duration": "15 min", "level": "All levels", "description": "Gentle relaxation before bedtime.", "xp_reward": 75},
    {"id": "med_4", "name": "Anxiety Release", "category": "Anxiety", "duration": "12 min", "level": "Intermediate", "description": "Grounding techniques for anxious moments.", "xp_reward": 70},
    {"id": "med_5", "name": "Loving Kindness", "category": "Mindfulness", "duration": "10 min", "level": "All levels", "description": "Meditation focusing on compassionate love.", "xp_reward": 60},
    {"id": "med_6", "name": "Box Breathing", "category": "Breathing", "duration": "5 min", "level": "All levels", "description": "Navy SEAL technique for stress control.", "xp_reward": 50}
]

class MeditationLogRequest(BaseModel):
    meditation_id: str
    duration_minutes: int

@router.get("/api/meditations")
async def get_meditations(token: dict = Depends(get_current_user_token)):
    return MEDITATIONS_LIST

@router.post("/api/meditation")
async def log_meditation(req: MeditationLogRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # Retrieve matching meditation info
    med_info = next((m for m in MEDITATIONS_LIST if m["id"] == req.meditation_id), None)
    if not med_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meditation session not found"
        )
        
    xp_reward = med_info["xp_reward"]
    
    # 1. Log to meditation_history
    med_col = get_collection("meditation_history")
    await med_col.insert_one({
        "user_id": user_id,
        "meditation_id": req.meditation_id,
        "duration_minutes": req.duration_minutes,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
    
    # 2. Log to general activity history
    await HistoryRepository.log_activity(
        user_id=user_id,
        activity_type="meditation",
        activity_id=req.meditation_id,
        duration=req.duration_minutes,
        xp=xp_reward
    )
    
    # 3. Add XP and recalculate score
    rewards = await add_xp_and_evaluate_rewards(user_id, xp_reward)
    await calculate_user_wellness_score(user_id)
    
    return {
        "status": "success",
        "xp_added": xp_reward,
        "rewards": rewards
    }
