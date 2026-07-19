import datetime
from fastapi import APIRouter, Depends
from app.schemas.wellness import ChatRequest
from app.auth.auth_handler import get_current_user_token
from app.services.gemini_service import generate_chat_response, generate_chat_response_with_details
from app.database.connection import get_collection

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

@router.post("")
async def chat(req: ChatRequest, token: dict = Depends(get_current_user_token)):
    user_id = token["sub"]

    # 1. Determine which method of prompt generation to use
    if req.messages:
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in req.messages]
        response_text = await generate_chat_response(messages_dict, image=req.image, pdf=req.pdf)
    else:
        history_list = []
        if req.history:
            history_list = [{"role": msg.role, "content": msg.content} for msg in req.history]
        response_text = await generate_chat_response_with_details(
            message=req.message or "",
            emotion=req.emotion,
            journal=req.journal,
            history=history_list
        )

    # 2. Log activity
    try:
        activity_col = get_collection("activity_history")
        await activity_col.insert_one({
            "user_id": user_id,
            "activity_type": "ai_chat",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        })
    except Exception:
        pass

    return {"response": response_text}
