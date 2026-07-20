import logging
from typing import Dict, Optional
from app.config.settings import settings

logger = logging.getLogger("mannsetu.emotion")

EMOTION_MAPPING = {
    "joy": "Joy", "excitement": "Joy", "amusement": "Joy",
    "pride": "Optimism", "optimism": "Optimism", "relief": "Optimism",
    "love": "Love", "caring": "Love", "gratitude": "Love",
    "sadness": "Sadness", "grief": "Sadness",
    "disappointment": "Disappointment", "disapproval": "Disappointment", "remorse": "Disappointment",
    "confusion": "Confusion", "curiosity": "Confusion",
    "fear": "Fear",
    "nervousness": "Anxiety",
    "annoyance": "Stress", "anger": "Stress", "disgust": "Stress"
}

TARGET_EMOTIONS = ["Stress", "Fear", "Joy", "Sadness", "Love", "Optimism", "Anxiety", "Confusion", "Disappointment"]

# Maps primary emotion to suggested mood score (1-10) and stress score (0-100)
EMOTION_METRICS = {
    "Stress": {"mood": 3, "stress": 85},
    "Fear": {"mood": 2, "stress": 80},
    "Joy": {"mood": 9, "stress": 10},
    "Sadness": {"mood": 2, "stress": 55},
    "Love": {"mood": 9, "stress": 10},
    "Optimism": {"mood": 8, "stress": 15},
    "Anxiety": {"mood": 3, "stress": 75},
    "Confusion": {"mood": 5, "stress": 45},
    "Disappointment": {"mood": 4, "stress": 65},
    "Neutral": {"mood": 6, "stress": 20}
}

classifier = None

def init_classifier():
    """
    Initializes and downloads/caches the model. Called once during application startup.
    """
    global classifier
    if classifier is not None:
        return classifier
    try:
        from transformers import pipeline
        logger.info("Initializing Hugging Face pipeline (SamLowe/roberta-base-go_emotions)...")
        classifier = pipeline(
            "text-classification",
            model="SamLowe/roberta-base-go_emotions",
            top_k=5
        )
        logger.info("GoEmotions model loaded successfully and cached.")
        return classifier
    except Exception as e:
        logger.warning(f"Could not load local GoEmotions classifier: {e}. Will use API or rule-based fallback.")
        return None

async def query_hf_api(text: str) -> list:
    if not settings.HUGGINGFACE_TOKEN:
        return []
    try:
        import httpx
        url = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_TOKEN}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={"inputs": text}, headers=headers, timeout=10.0)
            if response.status_code == 200:
                res = response.json()
                if isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
                    return res[0]
    except Exception as e:
        logger.error(f"HF API call failed: {e}")
    return []

def rule_based_sentiment_analysis(text: str) -> dict:
    text_lower = text.lower()
    scores = {emo: 0.0 for emo in TARGET_EMOTIONS}
    
    keywords = {
        "Stress": ["stress", "tense", "pressure", "angry", "annoyed", "mad", "overwhelmed", "frustrated", "deadline", "busy"],
        "Fear": ["fear", "scared", "terrified", "frightened", "afraid", "threatened", "scary"],
        "Joy": ["happy", "joy", "glad", "excited", "wonderful", "great", "awesome", "cheerful", "smile", "laugh", "good"],
        "Sadness": ["sad", "unhappy", "cry", "grief", "depressed", "lonely", "gloomy", "heavy", "heartbroken", "hurt"],
        "Love": ["love", "care", "grateful", "appreciate", "warm", "affection", "kindness", "attached", "thanks"],
        "Optimism": ["hope", "optimistic", "future", "positive", "excited", "confident", "believe", "looking forward"],
        "Anxiety": ["anxious", "worry", "nervous", "scared", "panic", "dread", "uneasy", "apprehensive", "scared"],
        "Confusion": ["confused", "lost", "unsure", "doubt", "puzzled", "uncertain", "wonder", "don't know"],
        "Disappointment": ["disappointed", "let down", "sorry", "regret", "pity", "shame", "sadly"]
    }
    
    matched_any = False
    for emo, words in keywords.items():
        for word in words:
            if word in text_lower:
                scores[emo] += 0.4
                matched_any = True
                
    if matched_any:
        total = sum(scores.values())
        scores = {emo: float(val / total) for emo, val in scores.items()}
    else:
        scores = {emo: 0.0 for emo in TARGET_EMOTIONS}
        scores["Optimism"] = 0.2
        scores["Joy"] = 0.2
        scores["Love"] = 0.1
        scores["Confusion"] = 0.1
        scores["Disappointment"] = 0.1
        scores["Stress"] = 0.1
        scores["Anxiety"] = 0.1
        scores["Sadness"] = 0.05
        scores["Fear"] = 0.05
        
    return scores

async def detect_emotions(text: str) -> dict:
    """
    Analyzes text and returns a dictionary of probabilities for the 9 target emotions.
    """
    if not text.strip():
        return {emo: 0.0 for emo in TARGET_EMOTIONS}

    # 1. Try local pipeline classifier
    if classifier is not None:
        try:
            results = classifier(text)[0]
            scores = {emo: 0.0 for emo in TARGET_EMOTIONS}
            for item in results:
                raw_label = item["label"].lower()
                mapped = EMOTION_MAPPING.get(raw_label)
                if mapped:
                    scores[mapped] += item["score"]
            
            total = sum(scores.values())
            if total > 0:
                return {emo: float(val / total) for emo, val in scores.items()}
        except Exception as e:
            logger.error(f"Local pipeline execution failed: {e}")

    # 2. Try HF API
    if settings.HUGGINGFACE_TOKEN:
        api_results = await query_hf_api(text)
        if api_results:
            scores = {emo: 0.0 for emo in TARGET_EMOTIONS}
            for item in api_results:
                raw_label = item["label"].lower()
                mapped = EMOTION_MAPPING.get(raw_label)
                if mapped:
                    scores[mapped] += item["score"]
            total = sum(scores.values())
            if total > 0:
                return {emo: float(val / total) for emo, val in scores.items()}

    # 3. Fallback to keyword-based
    return rule_based_sentiment_analysis(text)

async def analyze_emotion_full(text: str) -> dict:
    """
    Returns full analysis dictionary mapping:
    - primary_emotion
    - confidence
    - top_emotions
    - stress_score
    - mood_score
    """
    emotions = await detect_emotions(text)
    primary_emotion = max(emotions, key=emotions.get) if emotions else "Neutral"
    confidence = emotions.get(primary_emotion, 1.0)
    
    # Calculate scores based on mappings
    metrics = EMOTION_METRICS.get(primary_emotion, EMOTION_METRICS["Neutral"])
    
    return {
        "primary_emotion": primary_emotion,
        "confidence": float(confidence),
        "top_emotions": emotions,
        "stress_score": metrics["stress"],
        "mood_score": metrics["mood"]
    }
