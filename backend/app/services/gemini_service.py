import logging
import google.generativeai as genai
from typing import List, Optional
from app.config.settings import settings

logger = logging.getLogger("mannsetu.gemini")

if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)
else:
    logger.warning("GOOGLE_API_KEY is not set. Running Gemini Service in fallback mock mode.")

COACH_SYSTEM_INSTRUCTION = """
You are the AI Coach of MannSetu AI, a private AI wellness companion. 
Your goal is to support, motivate, and guide the user in programming, career, study, mental wellness, motivation, lifestyle, technology, health education, and general inquiries.

Rules of Conduct:
1. Always be supportive, respectful, and non-judgmental.
2. NEVER diagnose any mental or physical illness, disease, or medical condition.
3. NEVER prescribe treatment, medication, or therapies.
4. You are NOT a replacement for professional medical care. Make this clear if the user asks for diagnostic advice.
5. If the conversation indicates the user is in severe distress, experiencing suicidal thoughts, self-harm intentions, or is otherwise at risk, you MUST immediately and gently encourage them to reach out to trusted friends, family, or professional/emergency crisis services. Provide reassurance, and avoid diagnostic/medical advice.

Maintain a premium, friendly, coaching-focused tone. Provide actionable, positive advice. Use markdown in your responses.
"""

def get_gemini_model():
    if not settings.GOOGLE_API_KEY:
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

async def generate_chat_response(messages: list, image: Optional[dict] = None, pdf: Optional[dict] = None) -> str:
    """
    messages: list of dicts with keys 'role' ('user' or 'model'/'assistant') and 'content'.
    """
    if not settings.GOOGLE_API_KEY:
        return get_mock_coach_response(messages)

    try:
        model = get_gemini_model()
        if not model:
            return get_mock_coach_response(messages)

        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({
                "role": role,
                "parts": [msg["content"]]
            })

        # Process PDF context
        if pdf and "data" in pdf:
            try:
                import base64
                import io
                import pypdf
                pdf_bytes = base64.b64decode(pdf["data"])
                pdf_file = io.BytesIO(pdf_bytes)
                reader = pypdf.PdfReader(pdf_file)
                pdf_text = ""
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        pdf_text += t + "\n"
                
                if pdf_text.strip():
                    context_instr = f"\n\n[Context from uploaded PDF '{pdf.get('filename', 'document.pdf')}']:\n\"\"\"\n{pdf_text.strip()}\n\"\"\""
                    if contents and contents[-1]["role"] == "user":
                        contents[-1]["parts"][0] = contents[-1]["parts"][0] + context_instr
            except Exception as pe:
                logger.error(f"Error parsing PDF in Gemini service: {pe}")

        # Process Image part
        if image and "data" in image and "mime_type" in image:
            try:
                import base64
                img_bytes = base64.b64decode(image["data"])
                image_part = {
                    "mime_type": image["mime_type"],
                    "data": img_bytes
                }
                if contents and contents[-1]["role"] == "user":
                    contents[-1]["parts"].append(image_part)
            except Exception as ie:
                logger.error(f"Error appending image to Gemini parts: {ie}")

        response = await model.generate_content_async(contents)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API generation failed: {e}. Falling back to mock response.")
        return get_mock_coach_response(messages)

async def generate_chat_response_with_details(
    message: str,
    emotion: Optional[str] = None,
    journal: Optional[str] = None,
    history: Optional[List[dict]] = None
) -> str:
    """
    Generate response incorporating current emotion, journal entry context, and chat history.
    """
    if not settings.GOOGLE_API_KEY:
        mock_history = [{"role": m.get("role", "user"), "content": m.get("content", "")} for m in (history or [])]
        mock_history.append({"role": "user", "content": message})
        return get_mock_coach_response(mock_history)

    try:
        # Build prompt incorporating context
        context_parts = []
        if emotion:
            context_parts.append(f"[Context: User is currently feeling: {emotion}]")
        if journal:
            context_parts.append(f"[Context: User recently journaled: '{journal}']")
        
        context_prefix = " ".join(context_parts)
        
        # Build contents from history
        contents = []
        for msg in (history or []):
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [msg.get("content", "")]
            })
            
        # Add current message
        current_content = f"{context_prefix} {message}".strip()
        contents.append({
            "role": "user",
            "parts": [current_content]
        })

        model = get_gemini_model()
        if not model:
            return get_mock_coach_response([{"role": "user", "content": message}])

        response = await model.generate_content_async(contents)
        return response.text
    except Exception as e:
        logger.error(f"Gemini advanced API generation failed: {e}")
        return get_mock_coach_response([{"role": "user", "content": message}])

async def generate_journal_summary_and_insights(journal_content: str) -> dict:
    if not settings.GOOGLE_API_KEY:
        return {
            "summary": "This journal entry reflects on your daily activities, challenges, and thoughts.",
            "insights": ["You are actively reflecting on your experiences.", "Identifying areas of growth is a positive sign."],
            "reflection": "What is one small step you can take tomorrow to address the main theme of today?",
            "keywords": ["journal", "reflections", "mindfulness"],
            "suggestions": ["Try a 5-minute breathing break", "Connect with a friend"]
        }

    try:
        prompt = f"""
        Analyze the following journal entry:
        \"\"\"{journal_content}\"\"\"

        Provide a JSON response with the following keys:
        - "summary": A brief 1-2 sentence supportive summary of the entry.
        - "insights": A list of 2-3 positive insights or emotional takeaways.
        - "reflection": A single thoughtful follow-up question for deep reflection.
        - "keywords": A list of 3-4 keywords describing themes in the journal.
        - "suggestions": A list of 2 action suggestions to improve mood/reduce stress.

        Return ONLY the raw JSON object, no Markdown wrappers, no additional text.
        """
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
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
            "reflection": "What is one small step you can take tomorrow to address the main theme of today?",
            "keywords": ["journal", "reflections", "mindfulness"],
            "suggestions": ["Try a 5-minute breathing break", "Connect with a friend"]
        }

def get_mock_coach_response(messages: list) -> str:
    last_user_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            last_user_message = msg.get("content", "").lower()
            break

    if "help" in last_user_message or "hurt" in last_user_message or "die" in last_user_message or "suicide" in last_user_message:
        return "I hear that you are going through a really tough time. Please know you are not alone, and there is support available. I strongly encourage you to connect with a trusted friend, family member, or professional crisis counselor. You can find emergency resources and helplines in the **Emergency Help** section of your dashboard. 💙"

    if "sad" in last_user_message or "anxious" in last_user_message or "stress" in last_user_message:
        return "I'm sorry you are feeling this way. Stress and anxiety can be overwhelming. Take a moment to pause and focus on your breathing. You might also want to try one of our short mindfulness sessions on the **Meditation** tab. I'm here to support you. What else is on your mind?"

    return "Thank you for sharing that with me. As your wellness companion, I'm here to listen and help you guide your energy toward positive actions. Remember, small steps daily lead to big changes. What area of wellness or personal growth would you like to explore next?"
