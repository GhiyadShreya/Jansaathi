import re
from PIL import Image
import pytesseract
from typing import Literal, Dict, Any

# You may need to install Tesseract OCR engine on your system
# and configure the path if it's not in your PATH.
# e.g., pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

DocumentType = Literal["aadhaar", "income", "unknown"]

def _is_aadhaar(text: str) -> bool:
    """Heuristically check if text is from an Aadhaar card."""
    # Look for a 12-digit number, possibly with spaces
    if re.search(r'\b\d{4}\s?\d{4}\s?\d{4}\b', text):
        # Look for keywords
        if "government of india" in text.lower() or "unique identification authority" in text.lower():
            return True
    return False

def _is_income_certificate(text: str) -> bool:
    """Heuristically check if text is from an Income Certificate."""
    text_lower = text.lower()
    keywords = ["income certificate", "form 16", "annual income", "tehsildar", "mamlatdar"]
    if any(keyword in text_lower for keyword in keywords):
        # Look for a monetary value
        if re.search(r'rs\.?|₹', text_lower):
            return True
    return False

async def verify_document_with_ocr(image_bytes: bytes) -> Dict[str, Any]:
    """
    Performs OCR on an image and heuristically determines the document type.
    """
    try:
        image = Image.open(image_bytes)
        extracted_text = pytesseract.image_to_string(image)

        doc_type: DocumentType = "unknown"
        if _is_aadhaar(extracted_text):
            doc_type = "aadhaar"
        elif _is_income_certificate(extracted_text):
            doc_type = "income"

        return {"success": True, "doc_type": doc_type, "text": extracted_text[:1000]}
    except Exception as e:
        return {"success": False, "error": str(e)}