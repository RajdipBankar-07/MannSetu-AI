import datetime
from fastapi import APIRouter, Depends
from app.schemas.emotion import EmotionRequest, EmotionResponse
from app.auth.auth_handler import get_current_user_token
from app.services.emotion_service import analyze_emotion_full
from app.services.wellness_service import calculate_user_wellness_score
from app.database.connection import get_collection

router = APIRouter(prefix="/api/emotion", tags=["Emotion Detection"])

@router.post("/analyze", response_model=EmotionResponse)
async def analyze_emotion(req: EmotionRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # 1. Classify sentiment
    analysis = await analyze_emotion_full(req.text)
    
    # 2. Log to emotion_history
    emotion_col = get_collection("emotion_history")
    await emotion_col.insert_one({
        "user_id": user_id,
        "text": req.text,
        "primary_emotion": analysis["primary_emotion"],
        "confidence": analysis["confidence"],
        "emotions_distribution": analysis["top_emotions"],
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
    
    # 3. Log to mood_history
    mood_col = get_collection("mood_history")
    await mood_col.insert_one({
        "user_id": user_id,
        "mood": analysis["mood_score"],
        "primary_emotion": analysis["primary_emotion"],
        "note": req.text,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
    
    # 4. Trigger recalculation
    await calculate_user_wellness_score(user_id)
    
    return {
        "primary_emotion": analysis["primary_emotion"],
        "confidence": analysis["confidence"],
        "top_emotions": analysis["top_emotions"],
        "stress_score": analysis["stress_score"],
        "mood_score": analysis["mood_score"]
    }
