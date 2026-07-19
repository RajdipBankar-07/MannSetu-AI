export interface Game {
  _id: string
  game_id: string
  name: string
  category: string
  duration: string
  difficulty: string
  mood_benefit: string
  xp_reward: number
  cover_url: string
  completion_rate?: number
}

// Fallback games seed for local/offline testing
export const FALLBACK_GAMES: Game[] = [
  {"_id": "g1", "game_id": "mind_garden", "name": "Mind Garden", "category": "Mindfulness", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Reduces racing thoughts and encourages self-reflection.", "cover_url": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g2", "game_id": "emotion_journey", "name": "Emotion Journey", "category": "Cognitive", "difficulty": "Medium", "duration": "8 min", "xp_reward": 75, "mood_benefit": "Helps trace emotions and understand mood triggers.", "cover_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g3", "game_id": "calm_island", "name": "Calm Island", "category": "Relaxation", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Calms breathing using synthesized ambient sounds.", "cover_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g4", "game_id": "memory_palace", "name": "Memory Palace", "category": "Memory", "difficulty": "Medium", "duration": "6 min", "xp_reward": 60, "mood_benefit": "Improves mental focus and sharpens cognitive skills.", "cover_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g5", "game_id": "dream_builder", "name": "Dream Builder", "category": "Creativity", "difficulty": "Easy", "duration": "7 min", "xp_reward": 70, "mood_benefit": "Encourages positive future imagery and dreaming.", "cover_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g6", "game_id": "focus_forest", "name": "Focus Forest", "category": "Focus", "difficulty": "Hard", "duration": "10 min", "xp_reward": 100, "mood_benefit": "Strengthens visual attention span and filters stress.", "cover_url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g7", "game_id": "ocean_explorer", "name": "Ocean Explorer", "category": "Relaxation", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Deep breathing and exploration in a digital aquarium.", "cover_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g8", "game_id": "mountain_escape", "name": "Mountain Escape", "category": "Mindfulness", "difficulty": "Medium", "duration": "8 min", "xp_reward": 80, "mood_benefit": "Helps detach from immediate worries and gain perspective.", "cover_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g9", "game_id": "space_meditation", "name": "Space Meditation", "category": "Mindfulness", "difficulty": "Easy", "duration": "6 min", "xp_reward": 60, "mood_benefit": "Promotes deep relaxation and floating physical sensations.", "cover_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&h=250&auto=format&fit=crop"},
  {"_id": "g10", "game_id": "gratitude_village", "name": "Gratitude Village", "category": "Cognitive", "difficulty": "Easy", "duration": "5 min", "xp_reward": 50, "mood_benefit": "Focuses thinking on kindness and positive social interactions.", "cover_url": "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=400&h=250&auto=format&fit=crop"},
]

export async function getGames(): Promise<Game[]> {
  try {
    const response = await fetch("/api/games", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
      }
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.warn("Failed to fetch games from backend, falling back to local dataset", e)
  }
  return FALLBACK_GAMES
}

export async function completeGame(
  gameId: string,
  moodBefore: string,
  durationMinutes: number,
  xpEarned: number,
  score: number,
  notes: string[]
): Promise<any> {
  try {
    const response = await fetch("/api/games/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
      },
      body: JSON.stringify({
        game_id: gameId,
        mood_before: moodBefore,
        duration_minutes: durationMinutes,
        xp_earned: xpEarned,
        score,
        notes
      })
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.error("completeGame backend sync failed:", e)
  }
  return { status: "local_complete", xp_added: xpEarned }
}

export async function submitGameFeedback(
  gameId: string,
  moodBefore: string,
  feedback: string,
  rating: number
): Promise<any> {
  try {
    const response = await fetch("/api/games/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("mannsetu-token") || ""}`
      },
      body: JSON.stringify({
        game_id: gameId,
        mood_before: moodBefore,
        feedback,
        rating
      })
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    console.error("submitGameFeedback backend sync failed:", e)
  }
  return { status: "local_feedback" }
}
