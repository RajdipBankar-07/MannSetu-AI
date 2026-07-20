"""
Gemini Service for MannSetu AI

Server-side only — GOOGLE_API_KEY is never exposed to the frontend.
All calls are made here and return structured responses.
"""

import logging
import json
import google.generativeai as genai
from typing import List, Optional, Dict
from app.config.settings import settings

logger = logging.getLogger("mannsetu.gemini")

if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)
else:
    logger.warning("GOOGLE_API_KEY is not set. Running Gemini Service in fallback mock mode.")

# ─── System Prompt (MannSetu Guardrails) ─────────────────────────────────────

COACH_SYSTEM_INSTRUCTION = """
You are the AI Coach for MannSetu, a mental wellness support tool for Indian youth (students and young adults aged 18–35).

## Core Identity
- You are NOT a therapist, psychiatrist, or medical professional. Never claim to be one.
- You do NOT diagnose conditions, prescribe treatment, or recommend medications.
- You ALWAYS disclose that you are an AI if directly asked.
- You are a warm, empathetic, non-judgmental companion — a safe space to talk.

## Cultural Awareness
- You are deeply aware of the Indian youth context: intense academic pressure (JEE, NEET, board exams), family expectations, career anxiety, social comparison, and the strong cultural stigma around mental health and seeking help.
- You validate these pressures without minimising them. You do not say "just relax" or "others have it worse."
- You acknowledge both Hindi and English naturally if the user switches between them (Hinglish is fine).
- You understand the weight of phrases like "log kya kahenge" (what will people say) and "family ki izzat" (family honour).

## Crisis Protocol (NON-NEGOTIABLE)
- If a user expresses thoughts of self-harm, suicide, ending their life, or being in immediate danger — you IMMEDIATELY and GENTLY acknowledge their pain and provide crisis resources:
  - Tele-MANAS: 14416 (free, 24/7, Govt. of India)
  - iCall (TISS): 9152987821
- You do NOT attempt to resolve a crisis through conversation alone.
- You acknowledge, validate, encourage professional/human support, then keep the door open.
- Example: "I hear how much pain you're in right now — that takes real courage to share. You don't have to carry this alone. Please reach out to Tele-MANAS (14416) — they're available 24/7 and it's free. I'm still here with you."

## Conversation Style
- Keep responses concise and conversational — NOT lecture-like or clinical.
- Use markdown for structure when helpful, but don't over-format casual replies.
- Ask one open, thoughtful follow-up question per response to keep the conversation going.
- When appropriate, recommend 1–2 small, concrete coping activities (breathing exercises, grounding techniques, journaling prompts, short walks, gratitude lists).
- Never give a wall of options. Suggest what feels most relevant to the user's current state.

## Boundaries
- Do NOT give specific medical, legal, or financial advice.
- Do NOT make promises about outcomes ("this will definitely help").
- Do NOT shame or judge any lifestyle, choice, or cultural background.
- Redirect any request for diagnosis to professional help, warmly.
"""

# ─── Model Helpers ────────────────────────────────────────────────────────────

def get_gemini_model(model_name: str = "gemini-2.0-flash") -> Optional[genai.GenerativeModel]:
    if not settings.GOOGLE_API_KEY:
        return None
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=COACH_SYSTEM_INSTRUCTION
        )
        return model
    except Exception as e:
        logger.error(f"Error initializing Gemini GenerativeModel ({model_name}): {e}")
        # Fallback to 1.5-flash if 2.0 not available
        try:
            return genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=COACH_SYSTEM_INSTRUCTION
            )
        except Exception as e2:
            logger.error(f"Fallback model also failed: {e2}")
            return None


# ─── Core Chat Function (V2 — returns emotion + crisis info) ─────────────────

async def generate_chat_response_v2(
    messages: List[Dict],
    image: Optional[Dict] = None,
    pdf: Optional[Dict] = None,
) -> Dict:
    """
    Primary chat function for MannSetu AI Coach.

    Takes the full conversation history and returns:
    {
        "response": str,          # The AI coach reply
        "emotion": str,           # Detected emotion label (e.g., "Anxiety")
        "crisis_detected": bool,  # Whether crisis keywords were found
        "crisis_resources": str,  # Crisis resources text (empty if no crisis)
    }

    Crisis detection is run by the caller (chat.py route) BEFORE this function.
    This function also detects emotion via a separate lightweight Gemini call.
    """
    if not settings.GOOGLE_API_KEY:
        return _get_mock_response(messages)

    try:
        model = get_gemini_model()
        if not model:
            return _get_mock_response(messages)

        # Build contents array
        contents = _build_contents(messages, image, pdf)

        # Generate AI Coach response
        response = await model.generate_content_async(contents)
        reply_text = response.text

        # Detect emotion from the latest user message
        latest_user_msg = _get_latest_user_message(messages)
        emotion = await _detect_emotion_via_gemini(latest_user_msg) if latest_user_msg else "Neutral"

        return {
            "response": reply_text,
            "emotion": emotion,
            "crisis_detected": False,   # Set by caller
            "crisis_resources": "",      # Set by caller
        }

    except Exception as e:
        logger.error(f"Gemini API generation failed: {e}. Falling back to mock response.")
        return _get_mock_response(messages)


# ─── Emotion Detection (via Gemini structured JSON) ───────────────────────────

async def _detect_emotion_via_gemini(text: str) -> str:
    """
    Calls Gemini with a short structured prompt to detect the primary emotion.
    Returns one of: Joy, Sadness, Anxiety, Stress, Fear, Love, Optimism, Confusion, Disappointment, Neutral
    """
    if not settings.GOOGLE_API_KEY or not text.strip():
        return "Neutral"

    try:
        model = genai.GenerativeModel(model_name="gemini-2.0-flash")
        prompt = f"""Analyze the emotional tone of this message and respond with ONLY a single JSON object.

Message: "{text}"

Valid emotions: Joy, Sadness, Anxiety, Stress, Fear, Love, Optimism, Confusion, Disappointment, Neutral

Respond with ONLY this JSON format (no markdown, no explanation):
{{"emotion": "Anxiety", "confidence": 0.87}}"""

        response = await model.generate_content_async(prompt)
        raw = response.text.strip()

        # Strip any markdown wrappers
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = json.loads(raw)
        return data.get("emotion", "Neutral")

    except Exception as e:
        logger.warning(f"Emotion detection via Gemini failed: {e}")
        return "Neutral"


# ─── Legacy Functions (kept for backwards compatibility) ──────────────────────

async def generate_chat_response(messages: list, image: Optional[dict] = None, pdf: Optional[dict] = None) -> str:
    """Legacy function — returns only the response text. Use generate_chat_response_v2 for new code."""
    result = await generate_chat_response_v2(messages, image, pdf)
    return result["response"]


async def generate_chat_response_with_details(
    message: str,
    emotion: Optional[str] = None,
    journal: Optional[str] = None,
    history: Optional[List[dict]] = None
) -> str:
    """Legacy function — kept for backwards compatibility."""
    context_parts = []
    if emotion:
        context_parts.append(f"[Context: User is currently feeling: {emotion}]")
    if journal:
        context_parts.append(f"[Context: User recently journaled: '{journal}']")

    context_prefix = " ".join(context_parts)

    contents_list = list(history or [])
    current_content = f"{context_prefix} {message}".strip()
    contents_list.append({"role": "user", "content": current_content})

    result = await generate_chat_response_v2(contents_list)
    return result["response"]


# ─── Journal Analysis ─────────────────────────────────────────────────────────

async def generate_journal_summary_and_insights(journal_content: str) -> dict:
    """Analyzes a journal entry and returns structured insights."""
    if not settings.GOOGLE_API_KEY:
        return _get_mock_journal_insights()

    try:
        prompt = f"""
Analyze the following journal entry written by an Indian youth:
\"\"\"{journal_content}\"\"\"

Provide a JSON response with the following keys:
- "summary": A brief 1-2 sentence supportive summary of the entry.
- "insights": A list of 2-3 positive insights or emotional takeaways.
- "reflection": A single thoughtful follow-up question for deep reflection.
- "keywords": A list of 3-4 keywords describing themes in the journal.
- "suggestions": A list of 2 small, concrete action suggestions to improve mood or reduce stress (not generic advice).

Return ONLY the raw JSON object, no Markdown wrappers, no additional text.
"""
        model = genai.GenerativeModel(model_name="gemini-2.0-flash")
        response = await model.generate_content_async(prompt)
        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        return json.loads(text)
    except Exception as e:
        logger.error(f"Failed to analyze journal with Gemini: {e}")
        return _get_mock_journal_insights()


# ─── Private Helpers ──────────────────────────────────────────────────────────

def _build_contents(messages: list, image: Optional[dict], pdf: Optional[dict]) -> list:
    """Converts message list + optional attachments to Gemini contents format."""
    contents = []
    for msg in messages:
        role = "user" if msg.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [msg.get("content", "")]})

    # Inject PDF text into last user message
    if pdf and "data" in pdf:
        try:
            import base64
            import io
            import pypdf
            pdf_bytes = base64.b64decode(pdf["data"])
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            pdf_text = "".join(
                page.extract_text() + "\n"
                for page in reader.pages
                if page.extract_text()
            )
            if pdf_text.strip() and contents and contents[-1]["role"] == "user":
                contents[-1]["parts"][0] += f'\n\n[PDF "{pdf.get("filename", "document.pdf")}"]\n"""\n{pdf_text.strip()}\n"""'
        except Exception as e:
            logger.error(f"PDF parsing error: {e}")

    # Inject image into last user message
    if image and "data" in image and "mime_type" in image:
        try:
            import base64
            img_bytes = base64.b64decode(image["data"])
            image_part = {"mime_type": image["mime_type"], "data": img_bytes}
            if contents and contents[-1]["role"] == "user":
                contents[-1]["parts"].append(image_part)
        except Exception as e:
            logger.error(f"Image injection error: {e}")

    return contents


def _get_latest_user_message(messages: list) -> str:
    """Returns the content of the most recent user message."""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            return msg.get("content", "")
    return ""


def _get_mock_response(messages: list) -> dict:
    """Returns a mock response when the Gemini API is unavailable."""
    last_user_message = _get_latest_user_message(messages).lower()

    crisis_keywords = ["hurt", "die", "suicide", "kill myself", "end my life", "self harm"]
    if any(kw in last_user_message for kw in crisis_keywords):
        return {
            "response": (
                "I hear that you're going through a really tough time right now. "
                "Please know you're not alone, and there is support available. "
                "I strongly encourage you to reach out to **Tele-MANAS (14416)** — "
                "it's free, available 24/7, and completely confidential. "
                "You matter, and your life has value. 💙"
            ),
            "emotion": "Sadness",
            "crisis_detected": True,
            "crisis_resources": "",
        }

    if any(kw in last_user_message for kw in ["sad", "anxious", "stress", "depressed", "worried"]):
        return {
            "response": (
                "I'm sorry you're feeling this way. What you're experiencing sounds really hard. "
                "Let's take this one small step at a time — you don't have to figure everything out right now. "
                "Can you tell me more about what's been weighing on you most lately?"
            ),
            "emotion": "Anxiety",
            "crisis_detected": False,
            "crisis_resources": "",
        }

    return {
        "response": (
            "Thank you for sharing that with me. I'm here to listen and support you — "
            "whatever's on your mind. What would feel most helpful to explore right now? 🌱"
        ),
        "emotion": "Neutral",
        "crisis_detected": False,
        "crisis_resources": "",
    }


def _get_mock_journal_insights() -> dict:
    return {
        "summary": "This journal entry reflects on your daily experiences and emotional state.",
        "insights": [
            "You're actively taking time to reflect — that itself is a meaningful practice.",
            "Identifying what troubles you is the first step toward working through it.",
        ],
        "reflection": "What is one small thing you could do tomorrow to feel a little lighter?",
        "keywords": ["reflection", "emotions", "growth", "mindfulness"],
        "suggestions": [
            "Try a 5-minute box breathing exercise before bed.",
            "Write down 3 small things you're grateful for today.",
        ],
    }
