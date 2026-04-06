from fastapi import APIRouter
from app.models.models import SchemeRequest, VerifyRequest
from app.services.ai_service import get_matched_schemes, verify_document

router = APIRouter()


@router.post("/match")
async def match_schemes(request: SchemeRequest):
    schemes = await get_matched_schemes(request.profile, request.language.value)
    return {"schemes": schemes}


@router.post("/verify")
async def verify(request: VerifyRequest):
    result = await verify_document(request.doc_name, request.scheme_title, request.language.value)
    return result


@router.get("/demo")
async def get_demo_schemes():
    """Returns hardcoded demo schemes for testing"""
    return {"schemes": [
        {"id": "pmkisan", "title": "PM-Kisan Samman Nidhi", "description": "Direct income support of ₹6,000/year to small and marginal farmers.", "eligibility": "Farmers with less than 2 hectares land", "benefits": "₹6,000/year in 3 installments", "category": "Agriculture"},
        {"id": "ayushman", "title": "Ayushman Bharat PM-JAY", "description": "Health coverage of ₹5 lakh per family per year.", "eligibility": "BPL families as per SECC data", "benefits": "₹5 lakh health cover", "category": "Health"},
        {"id": "scholarship", "title": "Post-Matric Scholarship (SC/ST/OBC)", "description": "Financial assistance for students from reserved categories.", "eligibility": "SC/ST/OBC students, income below ₹2.5L", "benefits": "Tuition + maintenance allowance", "category": "Education"},
        {"id": "ujjwala", "title": "PM Ujjwala Yojana", "description": "Free LPG connection to women from BPL households.", "eligibility": "BPL women, no existing LPG", "benefits": "Free LPG connection + cylinder", "category": "Energy"},
        {"id": "mudra", "title": "PM Mudra Yojana", "description": "Collateral-free loans up to ₹10 lakh for small enterprises.", "eligibility": "Small business owners, entrepreneurs", "benefits": "Loans ₹50K – ₹10L", "category": "Business"},
    ]}
