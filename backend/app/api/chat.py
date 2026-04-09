from fastapi import APIRouter, HTTPException
from app.models.models import ChatRequest
from app.utils.storage import get_chat_history, save_chat_history
from app.services.ai import get_chat_response

router = APIRouter()


@router.post("/")
async def chat(request: ChatRequest):
    try:
        reply = await get_chat_response(
            message=request.message,
            profile=request.profile.model_dump() if request.profile else {},
            language=request.language.value,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    history = get_chat_history()
    history.append({"role": "user", "text": request.message})
    history.append({"role": "ai", "text": reply})
    save_chat_history(history)

    return {"reply": reply, "language": request.language}


@router.get("/history")
async def get_history():
    return {"history": get_chat_history()}


@router.delete("/history")
async def clear_history():
    save_chat_history([])
    return {"message": "Chat history cleared"}