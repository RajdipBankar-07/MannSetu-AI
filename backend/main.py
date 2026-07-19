import logging
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from bson import ObjectId
import datetime

from db import connect_db, close_db, get_collection
from auth import hash_password, verify_password, create_jwt_token, get_current_user_token
from services.gemini_service import generate_chat_response
from services.emotion_service import detect_emotions
from services.recommendation_service import get_personalized_recommendations
from services.journal_service import save_and_analyze_journal, get_weekly_journal_reflection
from services.wellness_service import calculate_user_wellness_score, add_xp_and_evaluate_rewards

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mannsetu.main")

app = FastAPI(title="MannSetu AI Backend", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and Shutdown events
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# --- Pydantic Models for Validation ---
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class EmotionRequest(BaseModel):
    text: str

class RecommendationRequest(BaseModel):
    mood_score: int
    primary_emotion: str
    mood_note: str

class JournalRequest(BaseModel):
    content: str
    mood_score: int

class ActivityRequest(BaseModel):
    activity_type: str  # 'game', 'meditation', etc.
    activity_id: str
    duration_minutes: int
    xp_earned: int
    score: Optional[int] = 0
    feedback_notes: Optional[List[str]] = []

class GameCompleteRequest(BaseModel):
    game_id: str
    mood_before: str
    duration_minutes: int
    xp_earned: int
    score: int
    notes: List[str]

class GameFeedbackRequest(BaseModel):
    game_id: str
    mood_before: str
    feedback: str
    rating: int

# --- Auth Routes ---
@app.post("/api/auth/signup")
async def signup(req: SignupRequest):
    users_col = get_collection("users")
    existing = await users_col.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed = hash_password(req.password)
    user_doc = {
        "name": req.name,
        "email": req.email,
        "password": hashed,
        "avatar": f"https://avatar.vercel.sh/{req.email}",
        "wellnessScore": 75,
        "streak": 1,
        "xp": 0,
        "level": 1,
        "badges": [],
        "favorites": [],
        "joinedAt": datetime.datetime.utcnow().isoformat() + "Z"
    }
    
    res = await users_col.insert_one(user_doc)
    user_id = str(res.inserted_id)
    token = create_jwt_token(user_id, req.email)
    
    # Clean output
    del user_doc["password"]
    user_doc["id"] = user_id
    if "_id" in user_doc:
        del user_doc["_id"]
        
    return {"token": token, "user": user_doc}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    users_col = get_collection("users")
    user = await users_col.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    user_id = str(user["_id"])
    token = create_jwt_token(user_id, req.email)
    
    # Clean output
    del user["password"]
    user["id"] = user_id
    if "_id" in user:
        del user["_id"]
        
    return {"token": token, "user": user}

# --- Core API Routes ---

@app.post("/api/chat")
async def chat(req: ChatRequest, token: dict = Depends(get_current_user_token)):
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
    response_text = await generate_chat_response(messages_dict)
    
    # Save conversation turn in history (optional logging)
    try:
        activity_col = get_collection("activity_history")
        await activity_col.insert_one({
            "user_id": token["sub"],
            "activity_type": "ai_chat",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        })
    except Exception:
        pass
        
    return {"response": response_text}

@app.post("/api/emotion/analyze")
async def analyze_emotion(req: EmotionRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    emotions = await detect_emotions(req.text)
    primary_emotion = max(emotions, key=emotions.get) if emotions else "Neutral"
    
    # Log to MongoDB
    history_col = get_collection("emotion_history")
    await history_col.insert_one({
        "user_id": user_id,
        "text": req.text,
        "emotions_distribution": emotions,
        "primary_emotion": primary_emotion,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
    
    # Log mood entry as well
    mood_score_map = {
        "Joy": 9, "Optimism": 8, "Love": 9, "Neutral": 6, 
        "Confusion": 5, "Disappointment": 4, "Anxiety": 3, 
        "Stress": 3, "Sadness": 2, "Fear": 2
    }
    mood_score = mood_score_map.get(primary_emotion, 6)
    
    mood_col = get_collection("mood_history")
    await mood_col.insert_one({
        "user_id": user_id,
        "mood": mood_score,
        "primary_emotion": primary_emotion,
        "note": req.text,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
    
    # Update score
    await calculate_user_wellness_score(user_id)
    
    return {
        "primary_emotion": primary_emotion,
        "confidence": emotions[primary_emotion] if emotions else 1.0,
        "distribution": emotions,
        "suggested_mood_score": mood_score
    }

@app.post("/api/recommendations")
async def recommendations(req: RecommendationRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    results = await get_personalized_recommendations(
        user_id=user_id,
        current_mood=req.mood_score,
        primary_emotion=req.primary_emotion,
        mood_note=req.mood_note
    )
    return results

@app.post("/api/journal/analyze")
async def analyze_journal(req: JournalRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    result = await save_and_analyze_journal(
        user_id=user_id,
        content=req.content,
        mood_score=req.mood_score
    )
    # Re-evaluate rewards
    await add_xp_and_evaluate_rewards(user_id, 20)
    await calculate_user_wellness_score(user_id)
    return result

@app.get("/api/journal/weekly")
async def weekly_journal_reflection(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    reflection = await get_weekly_journal_reflection(user_id)
    return reflection

@app.post("/api/wellness")
async def recalculate_wellness(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    score = await calculate_user_wellness_score(user_id)
    return {"wellness_score": score}

@app.get("/api/wellness/history")
async def get_wellness_history(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    col = get_collection("wellness_scores")
    cursor = col.find({"user_id": user_id}).sort("timestamp", -1)
    history = await cursor.to_list(length=30)
    for h in history:
        h["id"] = str(h["_id"])
        del h["_id"]
    return history

@app.post("/api/activity")
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
    
    # Award XP
    rewards = await add_xp_and_evaluate_rewards(user_id, req.xp_earned)
    # Recalculate wellness score
    await calculate_user_wellness_score(user_id)
    
    return {
        "status": "success",
        "xp_added": req.xp_earned,
        "new_xp": rewards["xp"],
        "new_level": rewards["level"],
        "unlocked_badges": rewards["unlocked_badges"]
    }

@app.get("/api/history")
async def get_user_history(token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    # Fetch mood logs
    mood_col = get_collection("mood_history")
    mood_cursor = mood_col.find({"user_id": user_id}).sort("timestamp", -1)
    moods = await mood_cursor.to_list(length=30)
    for m in moods:
        m["id"] = str(m["_id"])
        del m["_id"]
        
    # Fetch completed activities
    act_col = get_collection("activity_history")
    act_cursor = act_col.find({"user_id": user_id}).sort("timestamp", -1)
    activities = await act_cursor.to_list(length=30)
    for a in activities:
        a["id"] = str(a["_id"])
        del a["_id"]
        
    return {
        "mood_history": moods,
        "activity_history": activities
    }

# --- Additional Helpers for Games & Meditation ---
@app.get("/api/games")
async def get_games(token: dict = Depends(get_current_user_token)):
    games_col = get_collection("games")
    games = await games_col.find({}).to_list(length=100)
    for g in games:
        g["_id"] = str(g["_id"])
    return games

@app.post("/api/games/complete")
async def complete_game(req: GameCompleteRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    hist_col = get_collection("game_history")
    completion_doc = {
        "user_id": user_id,
        "game_id": req.game_id,
        "mood_before": req.mood_before,
        "duration_minutes": req.duration_minutes,
        "xp_earned": req.xp_earned,
        "score": req.score,
        "notes": req.notes,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    await hist_col.insert_one(completion_doc)
    
    # Save in activity history
    act_col = get_collection("activity_history")
    await act_col.insert_one({
        "user_id": user_id,
        "activity_type": "game",
        "activity_id": req.game_id,
        "duration_minutes": req.duration_minutes,
        "xp_earned": req.xp_earned,
        "score": req.score,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    })
    
    rewards = await add_xp_and_evaluate_rewards(user_id, req.xp_earned)
    await calculate_user_wellness_score(user_id)
    
    return {
        "status": "success",
        "rewards": rewards
    }

@app.post("/api/games/feedback")
async def submit_game_feedback(req: GameFeedbackRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]
    
    fb_col = get_collection("feedback")
    feedback_doc = {
        "user_id": user_id,
        "item_type": "game",
        "item_id": req.game_id,
        "mood_before": req.mood_before,
        "feedback": req.feedback,
        "rating": req.rating,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    await fb_col.insert_one(feedback_doc)
    
    # Award small bonus XP
    rewards = await add_xp_and_evaluate_rewards(user_id, 10)
    
    return {
        "status": "success",
        "rewards": rewards
    }
