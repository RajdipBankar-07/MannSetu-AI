from fastapi import APIRouter, Depends
from typing import List
from app.schemas.wellness import GameCompleteRequest, GameFeedbackRequest
from app.auth.auth_handler import get_current_user_token
from app.repositories.game_repository import GameRepository
from app.services.wellness_service import calculate_user_wellness_score, add_xp_and_evaluate_rewards

router = APIRouter(tags=["Wellness Games"])

@router.get("/api/games")
async def get_games(token: dict = Depends(get_current_user_token)):
    games = await GameRepository.get_all_games()
    return games

@router.post("/api/games/complete")
@router.post("/api/game/complete")
@router.post("/api/game")
async def complete_game(req: GameCompleteRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # Save completion
    success = await GameRepository.log_game_completion(
        user_id=user_id,
        game_id=req.game_id,
        mood_before=req.mood_before,
        duration=req.duration_minutes,
        xp=req.xp_earned,
        score=req.score,
        notes=req.notes
    )
    
    # Save in general activity log
    from app.repositories.history_repository import HistoryRepository
    await HistoryRepository.log_activity(
        user_id=user_id,
        activity_type="game",
        activity_id=req.game_id,
        duration=req.duration_minutes,
        xp=req.xp_earned,
        score=req.score
    )
    
    # Evaluate rewards & update score
    rewards = await add_xp_and_evaluate_rewards(user_id, req.xp_earned)
    await calculate_user_wellness_score(user_id)
    
    return {
        "status": "success",
        "rewards": rewards
    }

@router.post("/api/games/feedback")
@router.post("/api/game/feedback")
async def submit_game_feedback(req: GameFeedbackRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # Save feedback
    await GameRepository.log_game_feedback(
        user_id=user_id,
        game_id=req.game_id,
        mood_before=req.mood_before,
        feedback=req.feedback,
        rating=req.rating
    )
    
    # Reward small bonus XP
    rewards = await add_xp_and_evaluate_rewards(user_id, 10)
    return {
        "status": "success",
        "rewards": rewards
    }
