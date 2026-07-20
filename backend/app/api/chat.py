import datetime
from fastapi import APIRouter, Depends
from app.schemas.wellness import ChatRequest, ChatResponse
from app.auth.auth_handler import get_current_user_token
from app.services.gemini_service import generate_chat_response_v2, generate_chat_response_with_details
from app.services.crisis_service import detect_crisis, get_crisis_resources_text
from app.services.activity_service import get_activities_for_emotion
from app.database.connection import get_collection

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]

    # 1. Determine user message text for crisis check
    user_message_text = ""
    if req.messages:
        for msg in reversed(req.messages):
            if msg.role == "user":
                user_message_text = msg.content
                break
    elif req.message:
        user_message_text = req.message

    # 2. Run crisis detection BEFORE the AI reply — non-negotiable
    crisis_detected, crisis_severity, matched_pattern = detect_crisis(user_message_text)
    crisis_resources_text = get_crisis_resources_text() if crisis_detected else ""

    # 3. Generate AI Coach response
    if req.messages:
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
        result = await generate_chat_response_v2(messages_dict, image=req.image, pdf=req.pdf)
    else:
        history_list = [{"role": msg.role, "content": msg.content} for msg in (req.history or [])]
        response_text = await generate_chat_response_with_details(
            message=req.message or "",
            emotion=req.emotion,
            journal=req.journal,
            history=history_list
        )
        result = {
            "response": response_text,
            "emotion": req.emotion or "Neutral",
            "crisis_detected": crisis_detected,
            "crisis_resources": crisis_resources_text,
        }

    # 4. Override crisis fields with our detection result
    result["crisis_detected"] = crisis_detected
    result["crisis_resources"] = crisis_resources_text

    # 5. Get activity suggestions based on detected emotion
    emotion = result.get("emotion", "Neutral")
    activities = get_activities_for_emotion(emotion, count=2) if emotion != "Neutral" else []

    # 6. Log activity
    try:
        activity_col = get_collection("activity_history")
        await activity_col.insert_one({
            "user_id": user_id,
            "activity_type": "ai_chat",
            "emotion_detected": emotion,
            "crisis_detected": crisis_detected,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        })
    except Exception:
        pass

    return ChatResponse(
        response=result["response"],
        emotion=emotion,
        crisis_detected=crisis_detected,
        crisis_resources=crisis_resources_text,
        activities=activities,
    )
