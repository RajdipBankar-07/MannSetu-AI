from pydantic import BaseModel
from typing import List, Optional, Any

# Chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    # Support both list context and direct attributes
    messages: Optional[List[ChatMessage]] = None
    message: Optional[str] = None
    emotion: Optional[str] = None
    journal: Optional[str] = None
    history: Optional[List[ChatMessage]] = None
    image: Optional[dict] = None  # { mime_type: str, data: str (base64) }
    pdf: Optional[dict] = None    # { filename: str, data: str (base64) }

class ActivitySuggestion(BaseModel):
    id: str
    title: str
    description: str
    duration_minutes: int
    category: str
    emoji: str

class ChatResponse(BaseModel):
    response: str
    emotion: str = "Neutral"
    crisis_detected: bool = False
    crisis_resources: str = ""
    activities: List[ActivitySuggestion] = []


# Emotion
class EmotionRequest(BaseModel):
    text: str

class EmotionResponse(BaseModel):
    primary_emotion: str
    confidence: float
    top_emotions: dict
    stress_score: int
    mood_score: int

# Recommendations
class RecommendationRequest(BaseModel):
    mood_score: int
    primary_emotion: str
    mood_note: str

# Journal
class JournalRequest(BaseModel):
    content: str
    mood_score: int

# Activity
class ActivityRequest(BaseModel):
    activity_type: str  # 'game', 'meditation', etc.
    activity_id: str
    duration_minutes: int
    xp_earned: int
    score: Optional[int] = 0
    feedback_notes: Optional[List[str]] = []

# Games
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
