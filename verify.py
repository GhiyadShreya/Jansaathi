from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services import ocr_service

router = APIRouter()

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