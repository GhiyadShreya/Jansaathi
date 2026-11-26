from fastapi import APIRouter

from app.models.models import SchemeRequest
from app.services.ai import get_matched_schemes

router = APIRouter()

_DEMO_SCHEMES = [
    {"id": "pmkisan", "title": "PM-Kisan Samman Nidhi", "description": "Direct income support of Rs 6,000 per year to landholding farmer families.", "eligibility": "Landholding farmer families (income-tax payers and some others excluded)", "benefits": "Rs 6,000 per year in 3 installments", "category": "Agriculture", "required_documents": ["Aadhaar Card", "Land Documents"]},
    {"id": "ayushman", "title": "Ayushman Bharat PM-JAY", "description": "Health coverage of Rs 5 lakh per family per year.", "eligibility": "Poor families as per SECC data, and all citizens aged 70+", "benefits": "Rs 5 lakh health cover", "category": "Health", "required_documents": ["Aadhaar Card", "Ration Card"]},
    {"id": "scholarship", "title": "Post-Matric Scholarship", "description": "Financial assistance for students from reserved categories.", "eligibility": "SC/ST/OBC students, income below Rs 2.5 lakh", "benefits": "Tuition plus maintenance allowance", "category": "Education", "required_documents": ["Aadhaar Card", "Income Certificate", "Caste Certificate"]},
    {"id": "ujjwala", "title": "PM Ujjwala Yojana", "description": "Deposit-free LPG connection for adult women of poor households.", "eligibility": "BPL women with no existing LPG", "benefits": "Free LPG connection plus cylinder", "category": "Energy", "required_documents": ["Aadhaar Card", "Ration Card", "BPL Certificate"]},
    {"id": "mudra", "title": "PM Mudra Yojana", "description": "Collateral-free loans up to Rs 20 lakh for small enterprises.", "eligibility": "Small business owners and entrepreneurs", "benefits": "Shishu up to Rs 50,000, Kishore up to Rs 5 lakh, Tarun up to Rs 10 lakh, Tarun Plus up to Rs 20 lakh", "category": "Business", "required_documents": ["Aadhaar Card", "PAN Card", "Business Plan"]},
]

_HINDI_DEMO_SCHEMES = [
    {"id": "pmkisan", "title": "पीएम-किसान सम्मान निधि", "description": "भूमिधारक किसान परिवारों को प्रतिवर्ष ₹6,000 की प्रत्यक्ष आय सहायता।", "eligibility": "भूमिधारक किसान परिवार (आयकरदाता व कुछ अन्य वर्ग बाहर)", "benefits": "3 किस्तों में ₹6,000 प्रति वर्ष", "category": "कृषि", "required_documents": ["आधार कार्ड", "भूमि दस्तावेज़"]},
    {"id": "ayushman", "title": "आयुष्मान भारत पीएम-जय", "description": "प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य बीमा कवर।", "eligibility": "SECC डेटा के अनुसार गरीब परिवार, और 70+ आयु के सभी नागरिक", "benefits": "₹5 लाख तक स्वास्थ्य कवर", "category": "स्वास्थ्य", "required_documents": ["आधार कार्ड", "राशन कार्ड"]},
    {"id": "scholarship", "title": "पोस्ट-मैट्रिक छात्रवृत्ति", "description": "आरक्षित वर्ग के छात्रों के लिए वित्तीय सहायता।", "eligibility": "SC/ST/OBC छात्र, आय ₹2.5 लाख से कम", "benefits": "ट्यूशन फीस और रखरखाव भत्ता", "category": "शिक्षा", "required_documents": ["आधार कार्ड", "आय प्रमाण पत्र", "जाति प्रमाण पत्र"]},
    {"id": "ujjwala", "title": "पीएम उज्ज्वला योजना", "description": "बीपीएल परिवारों की महिलाओं को निःशुल्क एलपीजी कनेक्शन।", "eligibility": "बीपीएल महिला, पहले से एलपीजी कनेक्शन न हो", "benefits": "मुफ्त एलपीजी कनेक्शन और सिलेंडर सहायता", "category": "ऊर्जा", "required_documents": ["आधार कार्ड", "राशन कार्ड", "बीपीएल प्रमाण पत्र"]},
    {"id": "mudra", "title": "पीएम मुद्रा योजना", "description": "छोटे उद्यमों के लिए ₹20 लाख तक बिना गारंटी ऋण।", "eligibility": "छोटे व्यवसायी और उद्यमी", "benefits": "शिशु ₹50 हजार तक, किशोर ₹5 लाख तक, तरुण ₹10 लाख तक, तरुण प्लस ₹20 लाख तक", "category": "व्यवसाय", "required_documents": ["आधार कार्ड", "पैन कार्ड", "व्यवसाय योजना"]},
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
