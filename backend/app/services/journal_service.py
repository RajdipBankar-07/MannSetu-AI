import logging
import datetime
from app.services.gemini_service import generate_journal_summary_and_insights
from app.services.emotion_service import detect_emotions
from app.database.connection import get_collection

logger = logging.getLogger("mannsetu.journal")

async def save_and_analyze_journal(user_id: str, content: str, mood_score: int) -> dict:
    logger.info(f"Analyzing journal entry for User: {user_id}")
    
    # 1. Detect emotion probabilities
    emotions = await detect_emotions(content)
    primary_emotion = max(emotions, key=emotions.get) if emotions else "Neutral"

    # 2. Get Gemini analysis
    gemini_analysis = await generate_journal_summary_and_insights(content)
    summary = gemini_analysis.get("summary", "Logged journal entry.")
    insights = gemini_analysis.get("insights", ["Reflection noted."])
    reflection = gemini_analysis.get("reflection", "How did today make you feel?")
    keywords = gemini_analysis.get("keywords", ["reflection", "thoughts"])
    suggestions = gemini_analysis.get("suggestions", ["Continue logging daily entries"])

    # 3. Save structured document
    journal_col = get_collection("journal_entries")
    entry_doc = {
        "user_id": user_id,
        "content": content,
        "summary": summary,
        "insights": insights,
        "reflection": reflection,
        "keywords": keywords,
        "suggestions": suggestions,
        "primary_emotion": primary_emotion,
        "emotions_distribution": emotions,
        "mood_score": mood_score,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    
    res = await journal_col.insert_one(entry_doc)
    entry_doc["_id"] = str(res.inserted_id)

    # 4. Save to activity history
    try:
        activity_col = get_collection("activity_history")
        await activity_col.insert_one({
            "user_id": user_id,
            "activity_type": "journal",
            "activity_id": entry_doc["_id"],
            "details": {"emotion": primary_emotion, "summary": summary},
            "xp_earned": 20,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        })
    except Exception as e:
        logger.error(f"Failed to record journal activity: {e}")

    return entry_doc

async def get_weekly_journal_reflection(user_id: str) -> dict:
    journal_col = get_collection("journal_entries")
    seven_days_ago = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).isoformat() + "Z"
    
    query = {
        "user_id": user_id,
        "timestamp": {"$gte": seven_days_ago}
    }
    
    cursor = journal_col.find(query).sort("timestamp", 1)
    entries = await cursor.to_list(length=100)
    
    if not entries:
        return {
            "entries_count": 0,
            "average_mood": 7.0,
            "timeline": [],
            "positive_insights": ["Keep journaling to unlock weekly reflections!"],
            "weekly_summary": "No entries logged this week."
        }
        
    total_mood = sum(e["mood_score"] for e in entries)
    avg_mood = float(total_mood / len(entries))
    
    timeline = []
    insights = []
    for entry in entries:
        dt = entry["timestamp"][:10]
        timeline.append({
            "date": dt,
            "primary_emotion": entry.get("primary_emotion", "Neutral"),
            "mood_score": entry["mood_score"]
        })
        insights.extend(entry.get("insights", []))
        
    unique_insights = list(set(insights))[:5]
    
    return {
        "entries_count": len(entries),
        "average_mood": round(avg_mood, 1),
        "timeline": timeline,
        "positive_insights": unique_insights,
        "weekly_summary": f"You logged {len(entries)} times this week. Your primary emotional trend revolved around {entries[-1].get('primary_emotion')}."
    }
