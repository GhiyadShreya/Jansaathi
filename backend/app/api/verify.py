from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import ocr_service, ai
from app.models.models import VerifyRequest

router = APIRouter()

@router.post("/")
async def verify_document_with_ai(request: VerifyRequest):
    """
    Accepts a document name and scheme, and uses the AI to verify
    if the document is acceptable for the scheme.
    """
    try:
        result = await ai.verify_document(
            doc_name=request.doc_name,
            scheme_title=request.scheme_title,
            language=request.language.value,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI verification failed: {str(e)}")

@router.post("/ocr")
async def ocr_verify_document(file: UploadFile = File(...)):
    """
    Accepts an image file, performs OCR, and returns the detected document type
    and extracted text based on heuristics.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        result = await ocr_service.verify_document_with_ocr(contents)
        if not result["success"]:
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {result.get('error')}")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")