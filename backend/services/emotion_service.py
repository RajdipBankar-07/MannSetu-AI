import os
import logging
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")
logger = logging.getLogger("mannsetu.emotion")

# GoEmotions categories mapping
# 28 emotions: amusement, anger, annoyance, approval, caring, confusion, curiosity, desire, disappointment,
# disapproval, disgust, embarrassment, excitement, fear, gratitude, grief, joy, love, nervousness, optimism,
# pride, realization, relief, remorse, sadness, surprise, neutral, plus custom groupings.
EMOTION_MAPPING = {
    "joy": "Joy",
    "excitement": "Joy",
    "amusement": "Joy",
    "pride": "Optimism",
    "optimism": "Optimism",
    "relief": "Optimism",
    "love": "Love",
    "caring": "Love",
    "gratitude": "Love",
    "sadness": "Sadness",
    "grief": "Sadness",
    "disappointment": "Disappointment",
    "disapproval": "Disappointment",
    "remorse": "Disappointment",
    "confusion": "Confusion",
    "curiosity": "Confusion",
    "fear": "Fear",
    "nervousness": "Anxiety",
    "annoyance": "Stress",
    "anger": "Stress",
    "disgust": "Stress"
}

# Target emotions to return
TARGET_EMOTIONS = ["Stress", "Fear", "Joy", "Sadness", "Love", "Optimism", "Anxiety", "Confusion", "Disappointment"]

classifier = None

def init_classifier():
    global classifier
    # Only load model locally if we choose to and HF token or local installation succeeds
    # To keep startup extremely fast and light in environments without GPUs/pre-downloaded models,
    # we will lazily load it.
    if classifier is not None:
        return classifier
    try:
        from transformers import pipeline
        logger.info("Loading roberta-base-go_emotions model...")
        classifier = pipeline(
            "text-classification",
            model="SamLowe/roberta-base-go_emotions",
            top_k=5
        )
        logger.info("GoEmotions model loaded successfully.")
        return classifier
    except Exception as e:
        logger.warning(f"Could not load local GoEmotions classifier: {e}. Will use API or rule-based fallback.")
        return None

async def query_hf_api(text: str) -> list:
    """
    Query Hugging Face Inference API directly.
    """
    if not HUGGINGFACE_TOKEN:
        return []
    try:
        import httpx
        url = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
        headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={"inputs": text}, headers=headers, timeout=10.0)
            if response.status_code == 200:
                # Returns [[{"label": "...", "score": ...}, ...]]
                res = response.json()
                if isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
                    return res[0]
    except Exception as e:
        logger.error(f"HF API call failed: {e}")
    return []

def rule_based_sentiment_analysis(text: str) -> dict:
    """
    Rule-based fallback classifier mapping keywords to scores.
    """
    text_lower = text.lower()
    scores = {emo: 0.0 for emo in TARGET_EMOTIONS}
    
    # Keyword matches
    keywords = {
        "Stress": ["stress", "tense", "pressure", "angry", "annoyed", "mad", "overwhelmed", "frustrated"],
        "Fear": ["fear", "scared", "terrified", "frightened", "afraid", "threatened"],
        "Joy": ["happy", "joy", "glad", "excited", "wonderful", "great", "awesome", "cheerful", "smile"],
        "Sadness": ["sad", "unhappy", "cry", "grief", "depressed", "lonely", "gloomy", "heavy", "heartbroken"],
        "Love": ["love", "care", "grateful", "appreciate", "warm", "affection", "kindness", "attached"],
        "Optimism": ["hope", "optimistic", "future", "positive", "excited", "confident", "believe"],
        "Anxiety": ["anxious", "worry", "nervous", "scared", "panic", "dread", "uneasy", "apprehensive"],
        "Confusion": ["confused", "lost", "unsure", "doubt", "puzzled", "uncertain", "wonder"],
        "Disappointment": ["disappointed", "let down", "sorry", "regret", "pity", "shame", "sadly"]
    }
    
    matched_any = False
    for emo, words in keywords.items():
        for word in words:
            if word in text_lower:
                scores[emo] += 0.4
                matched_any = True
                
    # Normalize scores
    if matched_any:
        total = sum(scores.values())
        scores = {emo: float(val / total) for emo, val in scores.items()}
    else:
        # Default neutral distribution
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
    Analyzes text and returns a dictionary of probabilities for each of the 9 target emotions.
    """
    if not text.strip():
        return {emo: 0.0 for emo in TARGET_EMOTIONS}

    # 1. Try local pipeline classifier
    local_pipe = init_classifier()
    if local_pipe:
        try:
            results = local_pipe(text)[0]  # list of label-score dicts
            scores = {emo: 0.0 for emo in TARGET_EMOTIONS}
            for item in results:
                raw_label = item["label"].lower()
                mapped = EMOTION_MAPPING.get(raw_label)
                if mapped:
                    scores[mapped] += item["score"]
            
            # Normalize to ensure target list adds up
            total = sum(scores.values())
            if total > 0:
                scores = {emo: float(val / total) for emo, val in scores.items()}
            else:
                scores = rule_based_sentiment_analysis(text)
            return scores
        except Exception as e:
            logger.error(f"Local pipeline execution failed: {e}")

    # 2. Try HF API if token is configured
    if HUGGINGFACE_TOKEN:
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
                scores = {emo: float(val / total) for emo, val in scores.items()}
                return scores

    # 3. Fallback to rule-based keyword analysis
    return rule_based_sentiment_analysis(text)
