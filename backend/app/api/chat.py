from fastapi import APIRouter
from app.models.models import ChatRequest
from app.services.ai_service import get_chat_response
from app.utils.storage import get_chat_history, save_chat_history

router = APIRouter()


@router.post("/")
async def chat(request: ChatRequest):
    history = get_chat_history()
    response = await get_chat_response(
        message=request.message,
        profile=request.profile,
        language=request.language.value,
        history=history
    )
    # Save to history
    history.append({"role": "user", "text": request.message})
    history.append({"role": "ai", "text": response})
    save_chat_history(history)
    
    return {"response": response, "language": request.language}


@router.delete("/history")
async def clear_history():
    save_chat_history([])
    return {"message": "Chat history cleared"}


@router.get("/history")
async def get_history():
    return {"history": get_chat_history()}
