import logging
import datetime
from bson import ObjectId
from db import get_collection

logger = logging.getLogger("mannsetu.wellness")

async def calculate_user_wellness_score(user_id: str) -> int:
    """
    Computes a score from 0 to 100 based on the last 7 days:
    - Mood average (40%): Higher average mood = higher score.
    - Journal logs (20%): 3+ logs/week gives full points.
    - Meditation logs (20%): 3+ sessions/week gives full points.
    - Games completed (20%): 3+ games/week gives full points.
    """
    try:
        seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        iso_cutoff = seven_days_ago.isoformat() + "Z"
        
        # 1. Average Mood
        mood_col = get_collection("mood_history")
        mood_cursor = mood_col.find({
            "user_id": user_id,
            "timestamp": {"$gte": iso_cutoff}
        })
        moods = await mood_cursor.to_list(length=100)
        mood_points = 50  # Default middle
        if moods:
            avg_mood = sum(m["mood"] for m in moods) / len(moods)  # Scale 1-10
            mood_points = avg_mood * 10
            
        # 2. Journal Logs
        journal_col = get_collection("journal_entries")
        journal_count = await journal_col.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": iso_cutoff}
        })
        journal_points = min(journal_count * 7, 20)  # Max 20 points
        
        # 3. Meditation Logs
        med_col = get_collection("meditation_history")
        med_count = await med_col.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": iso_cutoff}
        })
        meditation_points = min(med_count * 7, 20)  # Max 20 points

        # 4. Game Logs
        game_hist_col = get_collection("game_history")
        game_count = await game_hist_col.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": iso_cutoff}
        })
        game_points = min(game_count * 7, 20)  # Max 20 points

        # Calculate final composite score
        wellness_score = int(mood_points * 0.4 + journal_points + meditation_points + game_points)
        wellness_score = max(min(wellness_score, 100), 10)  # Boundaries: 10 to 100

        # Save to database wellness_scores history
        scores_col = get_collection("wellness_scores")
        await scores_col.insert_one({
            "user_id": user_id,
            "wellness_score": wellness_score,
            "breakdown": {
                "mood_avg": float(mood_points / 10) if moods else 5.0,
                "journal_count": journal_count,
                "meditation_count": med_count,
                "game_count": game_count
            },
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        })

        # Update user profile score
        users_col = get_collection("users")
        # Handle string or ObjectId lookup
        try:
            query = {"_id": ObjectId(user_id)}
        except Exception:
            query = {"_id": user_id}
            
        await users_col.update_one(query, {"$set": {"wellnessScore": wellness_score}})

        return wellness_score
    except Exception as e:
        logger.error(f"Failed to calculate wellness score: {e}")
        return 75  # Safe fallback default

async def add_xp_and_evaluate_rewards(user_id: str, xp_to_add: int) -> dict:
    """
    Adds XP, calculates new levels, and updates achievements.
    - Level equation: level = XP // 500 + 1
    """
    users_col = get_collection("users")
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"_id": user_id}

    user = await users_col.find_one(query)
    if not user:
        return {"xp": 0, "level": 1, "unlocked_badges": []}

    current_xp = user.get("xp", 0)
    current_level = user.get("level", 1)
    badges = user.get("badges", [])

    new_xp = current_xp + xp_to_add
    new_level = int(new_xp // 500) + 1

    # Check for achievements based on activities count
    unlocked_badges = []
    
    # 1. Level up badges
    if new_level > current_level:
        badge_name = f"Level {new_level} Warrior"
        if badge_name not in badges:
            unlocked_badges.append(badge_name)

    # 2. Activity count badges
    act_col = get_collection("activity_history")
    total_activities = await act_col.count_documents({"user_id": user_id})
    if total_activities >= 1 and "First Step" not in badges:
        unlocked_badges.append("First Step")
    if total_activities >= 10 and "Mindfulness Explorer" not in badges:
        unlocked_badges.append("Mindfulness Explorer")
    if total_activities >= 30 and "Wellness Master" not in badges:
        unlocked_badges.append("Wellness Master")

    # Update user in DB
    updates = {
        "xp": new_xp,
        "level": new_level
    }
    if unlocked_badges:
        updates["badges"] = badges + unlocked_badges
        
    await users_col.update_one(query, {"$set": updates})

    return {
        "xp": new_xp,
        "level": new_level,
        "unlocked_badges": unlocked_badges,
        "total_xp_added": xp_to_add
    }
