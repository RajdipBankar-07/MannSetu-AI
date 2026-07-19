import logging
import random
from bson import ObjectId
from services.embedding_service import get_embedding, cosine_similarity
from db import get_collection

logger = logging.getLogger("mannsetu.recommendation")

# Static directory of other activities to match dynamically using embeddings
ACTIVITIES_DATABASE = [
    # Meditations
    {"id": "med_1", "type": "Meditation", "name": "4-7-8 Breathing", "category": "Breathing", "desc": "A deep breathing exercise to reduce anxiety and assist sleep.", "emotion_focus": ["Anxiety", "Stress", "Fear"]},
    {"id": "med_2", "type": "Meditation", "name": "Deep Body Scan", "category": "Mindfulness", "desc": "Focus attention on different parts of your body to release tension.", "emotion_focus": ["Stress", "Disappointment", "Sadness"]},
    {"id": "med_3", "type": "Meditation", "name": "Box Breathing Session", "category": "Breathing", "desc": "Four-step breathing technique for focus and emotional regulation.", "emotion_focus": ["Anxiety", "Confusion", "Stress"]},
    {"id": "med_4", "type": "Meditation", "name": "Progressive Relaxation", "category": "Relaxation", "desc": "Tense and release muscle groups to achieve deep body calmness.", "emotion_focus": ["Stress", "Fear", "Sadness"]},
    {"id": "med_5", "type": "Meditation", "name": "Loving Kindness", "category": "Mindfulness", "desc": "Meditation focusing on developing compassionate love and appreciation.", "emotion_focus": ["Disappointment", "Sadness", "Love"]},

    # Music / Audio
    {"id": "mus_1", "type": "Music", "name": "Rainforest Canopy", "category": "Nature Sounds", "desc": "Calming rain sounds mixed with tropical birds for deep sleep.", "emotion_focus": ["Stress", "Anxiety", "Fear"]},
    {"id": "mus_2", "type": "Music", "name": "Binaural Focus Beats", "category": "Binaural Beats", "desc": "Alpha wave frequencies designed to help you concentrate on tasks.", "emotion_focus": ["Confusion", "Optimism"]},
    {"id": "mus_3", "type": "Music", "name": "Zen Piano Sonata", "category": "Instrumental", "desc": "Soft, relaxing classical piano chords for winding down after a busy day.", "emotion_focus": ["Sadness", "Disappointment", "Stress"]},

    # Videos
    {"id": "vid_1", "type": "Videos", "name": "Tai Chi Morning Routine", "category": "Movement", "desc": "Slow flow morning Tai Chi session to stretch and ground energy.", "emotion_focus": ["Stress", "Confusion", "Optimism"]},
    {"id": "vid_2", "type": "Videos", "name": "Understanding Anxiety", "category": "Educational", "desc": "A short video explaining the neurology of anxiety and how to calm the amygdala.", "emotion_focus": ["Anxiety", "Fear"]},

    # Articles
    {"id": "art_1", "type": "Articles", "name": "Reframing Negative Thoughts", "category": "CBT Tips", "desc": "Learn how Cognitive Behavioral Therapy helps identify and stop negative mental loops.", "emotion_focus": ["Disappointment", "Sadness", "Anxiety"]},
    {"id": "art_2", "type": "Articles", "name": "The Power of Gratitude", "category": "Mindfulness", "desc": "Scientific benefits of keeping a daily gratitude list on your brain chemistry.", "emotion_focus": ["Love", "Optimism", "Sadness"]},

    # Sleep
    {"id": "slp_1", "type": "Sleep", "name": "Journey to the Moon", "category": "Sleep Story", "desc": "A calm, slow-paced bedtime narrative detailing a train journey in space.", "emotion_focus": ["Anxiety", "Stress", "Fear"]},
    {"id": "slp_2", "type": "Sleep", "name": "Deep Ocean Drifting", "category": "Sleep Sound", "desc": "Sub-surface underwater ambient sounds to slow heart rate for deep sleep.", "emotion_focus": ["Stress", "Sadness"]},

    # Community Groups
    {"id": "com_1", "type": "Community", "name": "Anxiety Support Circle", "category": "Support", "desc": "A safe place to share struggles and success stories about anxiety.", "emotion_focus": ["Anxiety", "Fear"]},
    {"id": "com_2", "type": "Community", "name": "Daily Gratitude Feed", "category": "Sharing", "desc": "Share daily highlights and support peers with kind reviews.", "emotion_focus": ["Love", "Optimism", "Joy"]}
]

# Cache embeddings for the database to speed up computations
EMBEDDINGS_CACHE = {}

def get_cached_activity_embedding(activity: dict) -> list:
    activity_id = activity["id"]
    if activity_id not in EMBEDDINGS_CACHE:
        combined_text = f"{activity['name']} {activity['category']} {activity['desc']}"
        EMBEDDINGS_CACHE[activity_id] = get_embedding(combined_text)
    return EMBEDDINGS_CACHE[activity_id]

async def get_personalized_recommendations(user_id: str, current_mood: int, primary_emotion: str, mood_note: str) -> dict:
    """
    Generate recommendations for Games, Meditations, Journals, Music, Sleep, Videos, Articles, Community.
    Based on:
    - User mood (1-10)
    - Primary emotion (Stress, Anxiety, Sadness, etc.)
    - Mood note (vector match)
    """
    logger.info(f"Generating recommendations for User: {user_id}, Emotion: {primary_emotion}")
    
    # Calculate note embedding
    query_vector = get_embedding(f"{primary_emotion} {mood_note}")

    # Fetch user details
    users_col = get_collection("users")
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}
    user = await users_col.find_one(query)
    favorites = user.get("favorites", []) if user else []

    # Get games database
    games_col = get_collection("games")
    games = await games_col.find_all().to_list(length=100) if hasattr(games_col, "find_all") else await games_col.find({}).to_list(length=100)
    
    # Process Games recommendations using vector matching
    game_matches = []
    for game in games:
        game_text = f"{game['name']} {game.get('category', '')} {game.get('mood_benefit', '')}"
        game_vector = get_embedding(game_text)
        sim = cosine_similarity(query_vector, game_vector)
        
        # Boost if category matches mood
        boost = 0.0
        if primary_emotion in ["Stress", "Anxiety", "Fear"] and game.get("category") in ["Relaxation", "Mindfulness"]:
            boost = 0.15
        elif primary_emotion in ["Confusion", "Disappointment"] and game.get("category") in ["Focus", "Memory", "Cognitive"]:
            boost = 0.15
            
        game_matches.append({
            "game_id": game["game_id"],
            "name": game["name"],
            "category": game.get("category", "Wellness"),
            "difficulty": game.get("difficulty", "Easy"),
            "duration": game.get("duration", "5 min"),
            "mood_benefit": game.get("mood_benefit", ""),
            "xp_reward": game.get("xp_reward", 50),
            "cover_url": game.get("cover_url", ""),
            "score": sim + boost
        })
    game_matches.sort(key=lambda x: x["score"], reverse=True)
    recommended_games = game_matches[:3]

    # Process all other activities from static database
    activity_matches = []
    for act in ACTIVITIES_DATABASE:
        act_vector = get_cached_activity_embedding(act)
        sim = cosine_similarity(query_vector, act_vector)
        
        # Boost if focus matches
        boost = 0.0
        if primary_emotion in act.get("emotion_focus", []):
            boost = 0.2
        if act["id"] in favorites:
            boost += 0.1
            
        activity_matches.append({
            **act,
            "score": sim + boost
        })
    
    activity_matches.sort(key=lambda x: x["score"], reverse=True)

    # Group recommendations by category
    results = {
        "games": recommended_games,
        "meditation": [],
        "music": [],
        "videos": [],
        "articles": [],
        "sleep": [],
        "community": []
    }

    # Fill sections (top matches)
    for act in activity_matches:
        category = act["type"].lower()
        if category in results and len(results[category]) < 2:
            results[category].append({
                "id": act["id"],
                "name": act["name"],
                "category": act["category"],
                "desc": act["desc"],
                "cover_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=400&h=250&auto=format&fit=crop"
            })

    # Add a journal recommendation explicitly based on emotions
    results["journal"] = [{
        "prompt": get_journal_prompt_for_emotion(primary_emotion),
        "focus": primary_emotion,
        "difficulty": "Easy",
        "duration": "5 min"
    }]

    # Save to MongoDB recommendations history
    try:
        rec_col = get_collection("recommendations")
        await rec_col.insert_one({
            "user_id": user_id,
            "primary_emotion": primary_emotion,
            "mood_score": current_mood,
            "results": results,
            "timestamp": get_current_iso_time()
        })
    except Exception as e:
        logger.error(f"Failed to log recommendations to database: {e}")

    return results

def get_journal_prompt_for_emotion(emotion: str) -> str:
    prompts = {
        "Stress": "What is the single biggest source of your tension today? Write down three things you can control about it.",
        "Fear": "Explore what is triggering your sense of danger. Write a logical rebuttal for the worst-case scenario.",
        "Joy": "Document today's highlights in details. What made you smile, and how can you repeat it tomorrow?",
        "Sadness": "Let your thoughts flow freely onto the screen. Write down one small kind thing someone did or that you appreciate.",
        "Love": "Write a message of appreciation to someone who supported you recently. Reflect on how they make you feel.",
        "Optimism": "What are you looking forward to next week? How can you lay the groundwork for it today?",
        "Anxiety": "List all your worries, then separate them into 'things I can act on' and 'things I must let go of'.",
        "Confusion": "Brainstorm the options before you. Write down the pros and cons of each choice to gain mental clarity.",
        "Disappointment": "What expectation wasn't met today? Reflect on what you learned from this outcome."
    }
    return prompts.get(emotion, "Write freely about how you feel today and what was on your mind.")

def get_current_iso_time():
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"
