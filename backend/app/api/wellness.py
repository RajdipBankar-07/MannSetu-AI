from fastapi import APIRouter, Depends
from app.auth.auth_handler import get_current_user_token
from app.services.wellness_service import calculate_user_wellness_score
from app.database.connection import get_collection

router = APIRouter(tags=["Wellness Scoring"])

@router.post("/api/wellness")
@router.get("/api/wellness")
async def recalculate_wellness_score(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    score = await calculate_user_wellness_score(user_id)
    return {"wellness_score": score}

@router.get("/api/wellness/history")
async def get_wellness_history(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    col = get_collection("wellness_scores")
    cursor = col.find({"user_id": user_id}).sort("timestamp", -1)
    history = await cursor.to_list(length=30)
    for h in history:
        h["id"] = str(h["_id"])
        del h["_id"]
    return history
