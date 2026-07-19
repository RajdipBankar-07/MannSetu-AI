import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/mannsetu_ai")
db_name = MONGODB_URI.split("/")[-1].split("?")[0] or "mannsetu_ai"

logger = logging.getLogger("mannsetu.db")

client = None
db = None

# Collections list
COLLECTIONS = {
    "users": "users",
    "emotion_history": "emotion_history",
    "mood_history": "mood_history",
    "journal_entries": "journal_entries",
    "recommendations": "recommendations",
    "activity_history": "activity_history",
    "games": "games",
    "game_history": "game_history",
    "meditation_history": "meditation_history",
    "wellness_scores": "wellness_scores",
    "feedback": "feedback"
}

async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client[db_name]
        logger.info(f"Connected to MongoDB database: {db_name}")
        await seed_games()
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise e

async def close_db():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")

def get_collection(name: str):
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_db first.")
    collection_name = COLLECTIONS.get(name)
    if not collection_name:
        raise ValueError(f"Unknown collection name: {name}")
    return db[collection_name]

# List of 20 premium wellness games to seed
INITIAL_GAMES = [
    {"game_id": "mind_garden", "name": "Mind Garden", "category": "Mindfulness", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Reduces racing thoughts and encourages self-reflection.", "cover_url": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "emotion_journey", "name": "Emotion Journey", "category": "Cognitive", "difficulty": "Medium", "duration": "8 min", "xp_reward": 75, "mood_benefit": "Helps trace emotions and understand mood triggers.", "cover_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "calm_island", "name": "Calm Island", "category": "Relaxation", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Calms breathing using synthesized ambient sounds.", "cover_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "memory_palace", "name": "Memory Palace", "category": "Memory", "difficulty": "Medium", "duration": "6 min", "xp_reward": 60, "mood_benefit": "Improves mental focus and sharpens cognitive skills.", "cover_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "dream_builder", "name": "Dream Builder", "category": "Creativity", "difficulty": "Easy", "duration": "7 min", "xp_reward": 70, "mood_benefit": "Encourages positive future imagery and dreaming.", "cover_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "focus_forest", "name": "Focus Forest", "category": "Focus", "difficulty": "Hard", "duration": "10 min", "xp_reward": 100, "mood_benefit": "Strengthens visual attention span and filters stress.", "cover_url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "ocean_explorer", "name": "Ocean Explorer", "category": "Relaxation", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Deep breathing and exploration in a digital aquarium.", "cover_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "mountain_escape", "name": "Mountain Escape", "category": "Mindfulness", "difficulty": "Medium", "duration": "8 min", "xp_reward": 80, "mood_benefit": "Helps detach from immediate worries and gain perspective.", "cover_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "space_meditation", "name": "Space Meditation", "category": "Mindfulness", "difficulty": "Easy", "duration": "6 min", "xp_reward": 60, "mood_benefit": "Promotes deep relaxation and floating physical sensations.", "cover_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "gratitude_village", "name": "Gratitude Village", "category": "Cognitive", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Focuses thinking on kindness and positive social interactions.", "cover_url": "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "zen_painter", "name": "Zen Painter", "category": "Creativity", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Unleashes creative expression via silent digital coloring.", "cover_url": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "music_therapy_studio", "name": "Music Therapy Studio", "category": "Relaxation", "difficulty": "Easy", "duration": "8 min", "xp_reward": 80, "mood_benefit": "Reduces stress through custom synthesizers.", "cover_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "pet_companion", "name": "Pet Companion", "category": "Relaxation", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Nurtures empathy and relaxation through positive animal care.", "cover_url": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "nature_photographer", "name": "Nature Photographer", "category": "Focus", "difficulty": "Medium", "duration": "6 min", "xp_reward": 60, "mood_benefit": "Encourages focusing on natural details and beauty.", "cover_url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "digital_aquarium", "name": "Digital Aquarium", "category": "Relaxation", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Tranquil viewing and feeding fishes to slow down thoughts.", "cover_url": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "peace_puzzle_adventure", "name": "Peace Puzzle Adventure", "category": "Memory", "difficulty": "Medium", "duration": "8 min", "xp_reward": 75, "mood_benefit": "Encourages problem-solving and focus in calm setups.", "cover_url": "https://images.unsplash.com/photo-1516116211223-5c359a36298a?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "story_builder", "name": "Story Builder", "category": "Creativity", "difficulty": "Easy", "duration": "7 min", "xp_reward": 70, "mood_benefit": "Fosters narrative expression and creative problem solving.", "cover_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "happiness_cafe", "name": "Happiness Cafe", "category": "Cognitive", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Practices positive self-talk and building happiness strategies.", "cover_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "wellness_city", "name": "Wellness City", "category": "Focus", "difficulty": "Medium", "duration": "9 min", "xp_reward": 90, "mood_benefit": "Fosters planning, balance, and mindful lifestyle decisions.", "cover_url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=400&h=250&auto=format&fit=crop"},
    {"game_id": "journey_to_inner_peace", "name": "Journey to Inner Peace", "category": "Mindfulness", "difficulty": "Hard", "duration": "10 min", "xp_reward": 100, "mood_benefit": "Combines breathing, memory, and cognitive reflection techniques.", "cover_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&h=250&auto=format&fit=crop"}
]

async def seed_games():
    try:
        games_col = db[COLLECTIONS["games"]]
        count = await games_col.count_documents({})
        if count == 0:
            await games_col.insert_many(INITIAL_GAMES)
            logger.info("Successfully seeded 20 initial wellness games into the database.")
        else:
            # Check if any new games need to be added
            for g in INITIAL_GAMES:
                existing = await games_col.find_one({"game_id": g["game_id"]})
                if not existing:
                    await games_col.insert_one(g)
    except Exception as e:
        logger.error(f"Failed to seed games: {e}")
