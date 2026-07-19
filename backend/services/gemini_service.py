import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
logger = logging.getLogger("mannsetu.gemini")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    logger.warning("GOOGLE_API_KEY is not set in environment. Running Gemini Service in fallback mock mode.")

# Safety system instruction for the Gemini Coach
COACH_SYSTEM_INSTRUCTION = """
You are the AI Coach of MannSetu AI, a private AI wellness companion. 
Your goal is to support, motivate, and guide the user in programming, career, study, mental wellness, motivation, lifestyle, technology, health education, and general inquiries.

Rules of Conduct:
1. Always be supportive, empathetic, respectful, and non-judgmental.
2. NEVER diagnose any mental or physical illness, disease, or medical condition.
3. NEVER prescribe treatment, medication, or therapies.
4. You are NOT a replacement for professional medical care, therapists, or doctors. Make this clear if the user asks for diagnosis or clinical advice.
5. If the conversation indicates the user is in severe distress, experiencing suicidal thoughts, self-harm intentions, or is otherwise at risk, you MUST immediately and gently encourage them to reach out to trusted friends, family, or professional/emergency crisis services. Provide reassurance, and avoid giving diagnostic advice.

Maintain a premium, friendly, coaching-focused tone. Provide actionable, positive advice. Use markdown in your responses.
"""

def get_gemini_model():
    if not GOOGLE_API_KEY:
        return None
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=COACH_SYSTEM_INSTRUCTION
        )
        return model
    except Exception as e:
        logger.error(f"Error initializing Gemini GenerativeModel: {e}")
        return None

async def generate_chat_response(messages: list) -> str:
    """
    messages: list of dicts with keys 'role' ('user' or 'assistant') and 'content'.
    """
    if not GOOGLE_API_KEY:
        return get_mock_coach_response(messages)

    try:
        model = get_gemini_model()
        if not model:
            return get_mock_coach_response(messages)

        # Convert chat history to Gemini's format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [msg["content"]]
            })

        response = await model.generate_content_async(contents)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API generation failed: {e}. Falling back to mock response.")
        return get_mock_coach_response(messages)

async def generate_journal_summary_and_insights(journal_content: str) -> dict:
    """
    Uses Gemini to analyze a journal entry and generate:
    - Summary
    - Key positive insights
    - Suggested reflections
    """
    if not GOOGLE_API_KEY:
        return {
            "summary": "This journal entry reflects on your daily activities, challenges, and thoughts.",
            "insights": ["You are actively reflecting on your experiences.", "Identifying areas of growth is a positive sign."],
            "reflection": "What is one small step you can take tomorrow to address the main theme of today?"
        }

    try:
        prompt = f"""
        Analyze the following journal entry:
        \"\"\"{journal_content}\"\"\"

        Provide a JSON response with the following keys:
        - "summary": A brief 1-2 sentence supportive summary of the entry.
        - "insights": A list of 2-3 positive insights or emotional takeaways.
        - "reflection": A single thoughtful follow-up question for deep reflection.

        Return ONLY the raw JSON object, no Markdown wrappers, no additional text.
        """
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
        # Clean up any potential markdown code fence output from Gemini
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        import json
        return json.loads(text)
    except Exception as e:
        logger.error(f"Failed to analyze journal with Gemini: {e}")
        return {
            "summary": "This journal entry reflects on your daily activities, challenges, and thoughts.",
            "insights": ["You are actively reflecting on your experiences.", "Identifying areas of growth is a positive sign."],
            "reflection": "What is one small step you can take tomorrow to address the main theme of today?"
        }

def get_mock_coach_response(messages: list) -> str:
    """
    Simple mock response logic for when the Gemini API key is missing or fails.
    """
    last_user_message = ""
    for msg in reversed(messages):
        if msg["role"] == "user":
            last_user_message = msg["content"].lower()
            break

    if "help" in last_user_message or "hurt" in last_user_message or "die" in last_user_message or "suicide" in last_user_message:
        return "I hear that you are going through a really tough time. Please know you are not alone, and there is support available. I strongly encourage you to connect with a trusted friend, family member, or professional crisis counselor. You can find emergency resources and helplines in the **Emergency** section of your dashboard. 💙"

    if "sad" in last_user_message or "anxious" in last_user_message or "stress" in last_user_message:
        return "I'm sorry you are feeling this way. Stress and anxiety can be overwhelming. Take a moment to pause and focus on your breathing. You might also want to try one of our short mindfulness sessions on the **Meditation** tab. I'm here to support you. What else is on your mind?"

    return "Thank you for sharing that with me. As your wellness companion, I'm here to listen and help you guide your energy toward positive actions. Remember, small steps daily lead to big changes. What area of wellness or personal growth would you like to explore next?"
