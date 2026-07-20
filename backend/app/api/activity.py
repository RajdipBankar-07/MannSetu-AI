import datetime
from fastapi import APIRouter, Depends, Query
from app.schemas.wellness import ActivityRequest
from app.auth.auth_handler import get_current_user_token
from app.services.wellness_service import calculate_user_wellness_score, add_xp_and_evaluate_rewards
from app.services.activity_service import get_activities_for_emotion, get_all_activities
from app.database.connection import get_collection

router = APIRouter(prefix="/api/activity", tags=["Activities"])

@router.post("")
async def log_activity(req: ActivityRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    hist_col = get_collection("activity_history")
    
    activity_doc = {
        "user_id": user_id,
        "activity_type": req.activity_type,
        "activity_id": req.activity_id,
        "duration_minutes": req.duration_minutes,
        "xp_earned": req.xp_earned,
        "score": req.score,
        "feedback_notes": req.feedback_notes,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    
    await hist_col.insert_one(activity_doc)
    
    # Award XP & wellness recalculation
    rewards = await add_xp_and_evaluate_rewards(user_id, req.xp_earned)
    await calculate_user_wellness_score(user_id)
    
    return {
        "status": "success",
        "xp_added": req.xp_earned,
        "new_xp": rewards["xp"],
        "new_level": rewards["level"],
        "unlocked_badges": rewards["unlocked_badges"]
    }


@router.get("/for-emotion")
async def activities_for_emotion(
    emotion: str = Query(default="Neutral", description="Detected emotion label"),
    count: int = Query(default=2, ge=1, le=5, description="Number of activities to return"),
    _token: dict = Depends(get_current_user_token),
):
    """Returns evidence-informed micro-activities suited to the given emotional state."""
    activities = get_activities_for_emotion(emotion, count=count)
    return {"emotion": emotion, "activities": activities}


@router.get("/all")
async def all_activities(_token: dict = Depends(get_current_user_token)):
    """Returns the full library of micro-activities."""
    return {"activities": get_all_activities()}

