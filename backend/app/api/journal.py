from fastapi import APIRouter, Depends
from app.schemas.wellness import JournalRequest
from app.auth.auth_handler import get_current_user_token
from app.services.journal_service import save_and_analyze_journal, get_weekly_journal_reflection
from app.services.wellness_service import calculate_user_wellness_score, add_xp_and_evaluate_rewards

router = APIRouter(prefix="/api/journal", tags=["Journaling"])

@router.post("/analyze")
@router.post("")
async def analyze_journal(req: JournalRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    result = await save_and_analyze_journal(
        user_id=user_id,
        content=req.content,
        mood_score=req.mood_score
    )
    
    # Evaluate rewards & recalculate score
    await add_xp_and_evaluate_rewards(user_id, 20)
    await calculate_user_wellness_score(user_id)
    
    # Format ID for output
    result["id"] = result["_id"]
    return result

@router.get("/weekly")
async def weekly_journal_reflection(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    reflection = await get_weekly_journal_reflection(user_id)
    return reflection
