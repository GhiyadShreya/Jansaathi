from fastapi import APIRouter, HTTPException
from app.models.models import VerifyRequest
from app.services.ai import verify_document

router = APIRouter()


@router.post("/")
async def verify(request: VerifyRequest):
    try:
        result = await verify_document(
            doc_name=request.doc_name,
            scheme_title=request.scheme_title,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Verification service error: {e}")