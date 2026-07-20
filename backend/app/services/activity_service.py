"""
Activity Recommendation Service for MannSetu AI

A curated library of evidence-informed micro-activities tagged by emotional state.
Activities are brief, accessible, and culturally relevant to Indian youth.
"""

import random
from typing import List, Optional, Dict

# ─── Activity Library ─────────────────────────────────────────────────────────

ACTIVITIES = [
    # ── Breathing ──────────────────────────────────────────────────────────────
    {
        "id": "box-breathing",
        "title": "Box Breathing",
        "description": "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4 times. Calms the nervous system instantly.",
        "duration_minutes": 3,
        "category": "breathing",
        "emoji": "🫁",
        "emotions": ["Anxiety", "Stress", "Fear"],
    },
    {
        "id": "478-breathing",
        "title": "4-7-8 Breathing",
        "description": "Inhale for 4 seconds, hold for 7, exhale slowly for 8. A natural tranquiliser for your nervous system.",
        "duration_minutes": 5,
        "category": "breathing",
        "emoji": "😮‍💨",
        "emotions": ["Anxiety", "Fear", "Stress"],
    },
    {
        "id": "belly-breathing",
        "title": "Deep Belly Breathing",
        "description": "Place one hand on your belly. Breathe deeply so your belly rises, not your chest. 5 slow, deep breaths.",
        "duration_minutes": 2,
        "category": "breathing",
        "emoji": "🌬️",
        "emotions": ["Stress", "Anxiety", "Confusion"],
    },

    # ── Grounding ──────────────────────────────────────────────────────────────
    {
        "id": "54321-grounding",
        "title": "5-4-3-2-1 Grounding",
        "description": "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Anchors you in the present moment.",
        "duration_minutes": 3,
        "category": "grounding",
        "emoji": "🌿",
        "emotions": ["Anxiety", "Fear", "Confusion", "Stress"],
    },
    {
        "id": "cold-water",
        "title": "Cold Water Reset",
        "description": "Splash cold water on your face or hold a cold glass. It activates the dive reflex and slows your heart rate quickly.",
        "duration_minutes": 1,
        "category": "grounding",
        "emoji": "💧",
        "emotions": ["Anxiety", "Stress", "Fear"],
    },
    {
        "id": "body-scan",
        "title": "Quick Body Scan",
        "description": "Close your eyes. Slowly notice each part of your body from head to toes. Release any tension you find.",
        "duration_minutes": 5,
        "category": "grounding",
        "emoji": "🧘",
        "emotions": ["Stress", "Anxiety", "Sadness", "Confusion"],
    },
    {
        "id": "physical-movement",
        "title": "2-Minute Walk or Stretch",
        "description": "Stand up, walk around your room, or do a few neck rolls and shoulder stretches. Moving your body shifts your mood.",
        "duration_minutes": 2,
        "category": "movement",
        "emoji": "🚶",
        "emotions": ["Sadness", "Stress", "Confusion", "Disappointment"],
    },

    # ── Journaling Prompts ──────────────────────────────────────────────────────
    {
        "id": "journal-feelings",
        "title": "Name Your Feeling",
        "description": "Write for 2 minutes: What am I feeling right now? Where do I feel it in my body? What triggered it?",
        "duration_minutes": 5,
        "category": "journaling",
        "emoji": "📓",
        "emotions": ["Sadness", "Confusion", "Anxiety", "Disappointment"],
    },
    {
        "id": "journal-worry",
        "title": "Worry Dump",
        "description": "Write every worry that's in your head right now — no filter. Then circle the one thing you can actually influence today.",
        "duration_minutes": 5,
        "category": "journaling",
        "emoji": "📝",
        "emotions": ["Anxiety", "Stress", "Fear", "Confusion"],
    },
    {
        "id": "journal-letter",
        "title": "Write a Letter to Yourself",
        "description": "Write a kind, encouraging letter to yourself as if you were your own best friend. What would they say to you right now?",
        "duration_minutes": 10,
        "category": "journaling",
        "emoji": "💌",
        "emotions": ["Sadness", "Disappointment", "Fear"],
    },

    # ── Gratitude ──────────────────────────────────────────────────────────────
    {
        "id": "gratitude-three",
        "title": "3 Good Things",
        "description": "Write down 3 small things that went okay today — even tiny ones count. Did you drink water? Finish a task? That's enough.",
        "duration_minutes": 3,
        "category": "gratitude",
        "emoji": "🙏",
        "emotions": ["Sadness", "Disappointment", "Confusion"],
    },
    {
        "id": "gratitude-person",
        "title": "Think of Someone Kind",
        "description": "Think of one person who has been kind to you recently. What did they do? Consider sending them a quick message of thanks.",
        "duration_minutes": 2,
        "category": "gratitude",
        "emoji": "❤️",
        "emotions": ["Sadness", "Loneliness", "Disappointment"],
    },

    # ── Positive / Joy Amplifiers ───────────────────────────────────────────────
    {
        "id": "joy-memory",
        "title": "Replay a Happy Memory",
        "description": "Close your eyes and spend 2 minutes vividly recalling a moment when you felt happy, safe, or proud. Notice how your body feels.",
        "duration_minutes": 2,
        "category": "visualisation",
        "emoji": "🌈",
        "emotions": ["Joy", "Love", "Optimism"],
    },
    {
        "id": "celebrate-small",
        "title": "Celebrate a Small Win",
        "description": "Write down one small thing you accomplished recently. It doesn't have to be big — getting out of bed on a hard day counts.",
        "duration_minutes": 2,
        "category": "gratitude",
        "emoji": "🎉",
        "emotions": ["Joy", "Optimism", "Sadness"],
    },
    {
        "id": "share-mood",
        "title": "Share Your Mood",
        "description": "Tell one person you trust how you're feeling today — a friend, sibling, or anyone safe. Connection is a mood lifter.",
        "duration_minutes": 5,
        "category": "connection",
        "emoji": "🤝",
        "emotions": ["Sadness", "Loneliness", "Love"],
    },

    # ── Study / Academic Pressure Specific ─────────────────────────────────────
    {
        "id": "pomodoro-break",
        "title": "Pomodoro Break",
        "description": "You've been working hard. Take a 5-minute complete break — no phone, no study. Just breathe or stare out the window.",
        "duration_minutes": 5,
        "category": "rest",
        "emoji": "🍅",
        "emotions": ["Stress", "Anxiety", "Confusion"],
    },
    {
        "id": "priority-list",
        "title": "Make a Priority List",
        "description": "Write down everything on your plate. Then number them 1, 2, 3 by urgency. Focus on just #1 for the next hour.",
        "duration_minutes": 5,
        "category": "productivity",
        "emoji": "📋",
        "emotions": ["Stress", "Anxiety", "Confusion"],
    },

    # ── Self-Compassion ─────────────────────────────────────────────────────────
    {
        "id": "self-compassion",
        "title": "Self-Compassion Pause",
        "description": "Place a hand on your heart. Silently say: 'This is hard. I'm doing my best. May I be kind to myself.' Repeat 3 times.",
        "duration_minutes": 2,
        "category": "mindfulness",
        "emoji": "💛",
        "emotions": ["Disappointment", "Sadness", "Fear", "Anxiety"],
    },
    {
        "id": "kind-inner-voice",
        "title": "Reframe Your Inner Voice",
        "description": "Notice a harsh thought you're having about yourself. Rewrite it as something a kind friend would say instead.",
        "duration_minutes": 3,
        "category": "mindfulness",
        "emoji": "🪞",
        "emotions": ["Disappointment", "Sadness", "Anxiety"],
    },
]

# Build emotion → activity index for fast lookup
_EMOTION_INDEX: Dict[str, list] = {}
for act in ACTIVITIES:
    for emo in act.get("emotions", []):
        _EMOTION_INDEX.setdefault(emo, []).append(act)

# Fallback pool (general-purpose activities)
_FALLBACK_ACTIVITIES = [a for a in ACTIVITIES if "Stress" in a["emotions"] or "Anxiety" in a["emotions"]]


def get_activities_for_emotion(emotion: str, count: int = 2) -> List[Dict]:
    """
    Returns `count` randomly selected activities appropriate for the given emotion.
    Falls back to general activities if the emotion has no specific matches.
    """
    pool = _EMOTION_INDEX.get(emotion, _FALLBACK_ACTIVITIES)
    selected = random.sample(pool, min(count, len(pool)))
    # Return clean copies without the internal 'emotions' tag
    return [
        {
            "id": a["id"],
            "title": a["title"],
            "description": a["description"],
            "duration_minutes": a["duration_minutes"],
            "category": a["category"],
            "emoji": a["emoji"],
        }
        for a in selected
    ]


def get_all_activities() -> List[dict]:
    """Returns all activities in the library."""
    return [
        {
            "id": a["id"],
            "title": a["title"],
            "description": a["description"],
            "duration_minutes": a["duration_minutes"],
            "category": a["category"],
            "emoji": a["emoji"],
            "emotions": a["emotions"],
        }
        for a in ACTIVITIES
    ]
