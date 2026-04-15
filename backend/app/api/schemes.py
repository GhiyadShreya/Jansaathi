from fastapi import APIRouter, HTTPException
from app.models.models import SchemeRequest
from app.services.ai import get_matched_schemes

router = APIRouter()

_DEMO_SCHEMES = [
    {"id": "pmkisan",    "title": "PM-Kisan Samman Nidhi",         "description": "Direct income support of ₹6,000/year to small and marginal farmers.", "eligibility": "Farmers with less than 2 hectares land",     "benefits": "₹6,000/year in 3 installments",      "category": "Agriculture"},
    {"id": "ayushman",  "title": "Ayushman Bharat PM-JAY",         "description": "Health coverage of ₹5 lakh per family per year.",                       "eligibility": "BPL families as per SECC data",             "benefits": "₹5 lakh health cover",               "category": "Health"},
    {"id": "scholarship","title": "Post-Matric Scholarship",        "description": "Financial assistance for students from reserved categories.",             "eligibility": "SC/ST/OBC students, income below ₹2.5L",    "benefits": "Tuition + maintenance allowance",     "category": "Education"},
    {"id": "ujjwala",   "title": "PM Ujjwala Yojana",              "description": "Free LPG connection to women from BPL households.",                      "eligibility": "BPL women, no existing LPG",                "benefits": "Free LPG connection + cylinder",      "category": "Energy"},
    {"id": "mudra",     "title": "PM Mudra Yojana",                "description": "Collateral-free loans up to ₹10 lakh for small enterprises.",            "eligibility": "Small business owners, entrepreneurs",      "benefits": "Loans ₹50K – ₹10L",                  "category": "Business"},
]


@router.get("/demo")
async def get_demo_schemes():
    return {"schemes": _DEMO_SCHEMES}


@router.post("/match")
async def match_schemes(request: SchemeRequest):
    try:
        schemes = await get_matched_schemes(
            profile=request.profile.model_dump(),
            language=request.language.value,
        )
        return {"schemes": schemes}
    except Exception as e:
        # Graceful fallback: return demo schemes so the UI never breaks
        return {"schemes": _DEMO_SCHEMES[:3], "fallback": True, "error": str(e)}