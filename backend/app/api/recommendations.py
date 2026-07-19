from fastapi import APIRouter, Depends
from app.schemas.wellness import RecommendationRequest
from app.auth.auth_handler import get_current_user_token
from app.services.recommendation_service import get_personalized_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("")
async def recommendations(req: RecommendationRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    results = await get_personalized_recommendations(
        user_id=user_id,
        current_mood=req.mood_score,
        primary_emotion=req.primary_emotion,
        mood_note=req.mood_note
    )
    return results
