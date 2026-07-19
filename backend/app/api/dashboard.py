import datetime
from fastapi import APIRouter, Depends
from app.auth.auth_handler import get_current_user_token
from app.repositories.user_repository import UserRepository
from app.repositories.history_repository import HistoryRepository
from app.repositories.game_repository import GameRepository
from app.database.connection import get_collection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Summary"])

@router.get("")
async def get_dashboard_summary(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # 1. Fetch user profile details
    user = await UserRepository.get_by_id(user_id)
    wellness_score = user.get("wellnessScore", 75) if user else 75
    
    # 2. Get mood history
    mood_history = await HistoryRepository.get_mood_history(user_id, limit=7)
    today_mood = mood_history[0] if mood_history else None
    
    # 3. Get latest recommendation record
    rec_col = get_collection("recommendations")
    latest_rec = await rec_col.find_one({"user_id": user_id}, sort=[("timestamp", -1)])
    recommendations_data = latest_rec.get("results") if latest_rec else None
    
    # 4. Fetch recent activities
    activities = await HistoryRepository.get_activity_history(user_id, limit=5)
    
    # 5. Aggregate weekly report data
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    iso_cutoff = seven_days_ago.isoformat() + "Z"
    
    journal_col = get_collection("journal_entries")
    journal_count = await journal_col.count_documents({"user_id": user_id, "timestamp": {"$gte": iso_cutoff}})
    
    med_col = get_collection("meditation_history")
    med_count = await med_col.count_documents({"user_id": user_id, "timestamp": {"$gte": iso_cutoff}})
    
    game_hist_col = get_collection("game_history")
    game_count = await game_hist_col.count_documents({"user_id": user_id, "timestamp": {"$gte": iso_cutoff}})
    
    # Default stress score maps to today's mood or 25
    stress_score = 25
    if today_mood:
        # Lower mood = higher stress
        stress_score = max(0, 100 - (today_mood["mood"] * 10))

    return {
        "today_mood": today_mood,
        "stress_score": stress_score,
        "wellness_score": wellness_score,
        "mood_history": mood_history[:7],
        "recommendations": recommendations_data,
        "recent_activities": activities,
        "weekly_report": {
            "journal_count": journal_count,
            "meditation_count": med_count,
            "game_count": game_count,
            "mood_average": sum(m["mood"] for m in mood_history) / len(mood_history) if mood_history else 6.0
        },
        "achievements": user.get("badges", []) if user else []
    }
