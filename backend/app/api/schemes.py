from fastapi import APIRouter

from app.models.models import SchemeRequest
from app.services.ai import get_matched_schemes

router = APIRouter()

_DEMO_SCHEMES = [
    {"id": "pmkisan", "title": "PM-Kisan Samman Nidhi", "description": "Direct income support of Rs 6,000 per year to small and marginal farmers.", "eligibility": "Farmers with less than 2 hectares land", "benefits": "Rs 6,000 per year in 3 installments", "category": "Agriculture", "required_documents": ["Aadhaar Card", "Land Documents"]},
    {"id": "ayushman", "title": "Ayushman Bharat PM-JAY", "description": "Health coverage of Rs 5 lakh per family per year.", "eligibility": "BPL families as per SECC data", "benefits": "Rs 5 lakh health cover", "category": "Health", "required_documents": ["Aadhaar Card", "Ration Card"]},
    {"id": "scholarship", "title": "Post-Matric Scholarship", "description": "Financial assistance for students from reserved categories.", "eligibility": "SC/ST/OBC students, income below Rs 2.5 lakh", "benefits": "Tuition plus maintenance allowance", "category": "Education", "required_documents": ["Aadhaar Card", "Income Certificate", "Caste Certificate"]},
    {"id": "ujjwala", "title": "PM Ujjwala Yojana", "description": "Free LPG connection to women from BPL households.", "eligibility": "BPL women with no existing LPG", "benefits": "Free LPG connection plus cylinder", "category": "Energy", "required_documents": ["Aadhaar Card", "Ration Card", "BPL Certificate"]},
    {"id": "mudra", "title": "PM Mudra Yojana", "description": "Collateral-free loans up to Rs 10 lakh for small enterprises.", "eligibility": "Small business owners and entrepreneurs", "benefits": "Loans from Rs 50,000 to Rs 10 lakh", "category": "Business", "required_documents": ["Aadhaar Card", "PAN Card", "Business Plan"]},
]

_HINDI_DEMO_SCHEMES = [
    {"id": "pmkisan", "title": "पीएम-किसान सम्मान निधि", "description": "छोटे और सीमांत किसानों को प्रतिवर्ष ₹6,000 की प्रत्यक्ष आय सहायता।", "eligibility": "2 हेक्टेयर से कम भूमि वाले किसान", "benefits": "3 किस्तों में ₹6,000 प्रति वर्ष", "category": "कृषि", "required_documents": ["आधार कार्ड", "भूमि दस्तावेज़"]},
    {"id": "ayushman", "title": "आयुष्मान भारत पीएम-जय", "description": "प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य बीमा कवर।", "eligibility": "SECC डेटा के अनुसार बीपीएल परिवार", "benefits": "₹5 लाख तक स्वास्थ्य कवर", "category": "स्वास्थ्य", "required_documents": ["आधार कार्ड", "राशन कार्ड"]},
    {"id": "scholarship", "title": "पोस्ट-मैट्रिक छात्रवृत्ति", "description": "आरक्षित वर्ग के छात्रों के लिए वित्तीय सहायता।", "eligibility": "SC/ST/OBC छात्र, आय ₹2.5 लाख से कम", "benefits": "ट्यूशन फीस और रखरखाव भत्ता", "category": "शिक्षा", "required_documents": ["आधार कार्ड", "आय प्रमाण पत्र", "जाति प्रमाण पत्र"]},
    {"id": "ujjwala", "title": "पीएम उज्ज्वला योजना", "description": "बीपीएल परिवारों की महिलाओं को निःशुल्क एलपीजी कनेक्शन।", "eligibility": "बीपीएल महिला, पहले से एलपीजी कनेक्शन न हो", "benefits": "मुफ्त एलपीजी कनेक्शन और सिलेंडर सहायता", "category": "ऊर्जा", "required_documents": ["आधार कार्ड", "राशन कार्ड", "बीपीएल प्रमाण पत्र"]},
    {"id": "mudra", "title": "पीएम मुद्रा योजना", "description": "छोटे उद्यमों के लिए ₹10 लाख तक बिना गारंटी ऋण।", "eligibility": "छोटे व्यवसायी और उद्यमी", "benefits": "₹50 हजार से ₹10 लाख तक ऋण", "category": "व्यवसाय", "required_documents": ["आधार कार्ड", "पैन कार्ड", "व्यवसाय योजना"]},
]


_SCHEME_LOCALIZATION = {
    "pmkisan": {
        "en": _DEMO_SCHEMES[0],
        "hi": _HINDI_DEMO_SCHEMES[0],
    },
    "ayushman": {
        "en": _DEMO_SCHEMES[1],
        "hi": _HINDI_DEMO_SCHEMES[1],
    },
    "scholarship": {
        "en": _DEMO_SCHEMES[2],
        "hi": _HINDI_DEMO_SCHEMES[2],
    },
    "ujjwala": {
        "en": _DEMO_SCHEMES[3],
        "hi": _HINDI_DEMO_SCHEMES[3],
    },
    "mudra": {
        "en": _DEMO_SCHEMES[4],
        "hi": _HINDI_DEMO_SCHEMES[4],
    },
}


def _get_demo_schemes(language: str):
    return _HINDI_DEMO_SCHEMES if language == "hi" else _DEMO_SCHEMES


def _normalize_scheme_language(schemes: list[dict], language: str) -> list[dict]:
    normalized_language = "hi" if language == "hi" else "en"
    normalized_schemes: list[dict] = []

    for scheme in schemes:
        scheme_id = scheme.get("id")
        localized = _SCHEME_LOCALIZATION.get(scheme_id, {}).get(normalized_language)
        if localized:
            normalized_schemes.append({
                **scheme,
                **localized,
                "required_documents": scheme.get("required_documents") or localized.get("required_documents", []),
            })
            continue

        normalized_schemes.append(scheme)

    return normalized_schemes


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
        return {"schemes": _normalize_scheme_language(schemes, request.language.value)}
    except Exception as e:
        return {"schemes": _get_demo_schemes(request.language.value)[:3], "fallback": True, "error": str(e)}
