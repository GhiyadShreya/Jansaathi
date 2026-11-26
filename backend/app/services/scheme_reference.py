"""
Reference facts for major central government schemes, injected into AI prompts so the
model uses official names, correct figures and official links instead of guessing.

Keep this list short and accurate. If a figure changes, update it here; when unsure,
leave the figure out rather than guess. Verify against the linked official sites.
"""

MYSCHEME_URL = "https://www.myscheme.gov.in"

# (official name, short code, Hindi name, key facts, official URL)
SCHEMES: list[tuple[str, str, str, str, str]] = [
    ("Pradhan Mantri Kisan Samman Nidhi", "PM-KISAN", "प्रधानमंत्री किसान सम्मान निधि",
     "₹6,000 per year to landholding farmer families, paid as 3 instalments of ₹2,000 by DBT.",
     "https://pmkisan.gov.in"),
    ("Pradhan Mantri Fasal Bima Yojana", "PMFBY", "प्रधानमंत्री फसल बीमा योजना",
     "Crop insurance. Farmer premium is at most 2% (kharif), 1.5% (rabi), 5% (commercial/horticulture crops).",
     "https://pmfby.gov.in"),
    ("Kisan Credit Card", "KCC", "किसान क्रेडिट कार्ड",
     "Short-term crop and allied-activity loans from banks at concessional interest, with a further rebate for prompt repayment.",
     MYSCHEME_URL),
    ("Pradhan Mantri Krishi Sinchayee Yojana", "PMKSY", "प्रधानमंत्री कृषि सिंचाई योजना",
     "Irrigation scheme ('Har Khet Ko Pani', 'Per Drop More Crop'); subsidy for drip/sprinkler micro-irrigation.",
     "https://pmksy.gov.in"),
    ("Pradhan Mantri Kisan Maan-Dhan Yojana", "PM-KMY", "प्रधानमंत्री किसान मान-धन योजना",
     "Voluntary pension for small and marginal farmers aged 18-40: ₹3,000 per month after age 60.",
     "https://maandhan.in"),
    ("Pradhan Mantri Shram Yogi Maan-Dhan", "PM-SYM", "प्रधानमंत्री श्रम योगी मान-धन",
     "Voluntary pension for unorganised workers aged 18-40 earning up to ₹15,000/month: ₹3,000 per month after 60.",
     "https://maandhan.in"),
    ("Ayushman Bharat Pradhan Mantri Jan Arogya Yojana", "AB PM-JAY", "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना",
     "Health cover up to ₹5 lakh per family per year for secondary/tertiary hospital care; all citizens aged 70+ are covered regardless of income.",
     "https://pmjay.gov.in"),
    ("Pradhan Mantri Awas Yojana - Gramin", "PMAY-G", "प्रधानमंत्री आवास योजना - ग्रामीण",
     "Financial assistance to build a pucca house for eligible rural households.",
     "https://pmayg.nic.in"),
    ("Pradhan Mantri Awas Yojana - Urban", "PMAY-U", "प्रधानमंत्री आवास योजना - शहरी",
     "Housing assistance / interest subsidy for eligible urban households.",
     "https://pmay-urban.gov.in"),
    ("Pradhan Mantri Mudra Yojana", "PMMY", "प्रधानमंत्री मुद्रा योजना",
     "Collateral-free business loans: Shishu up to ₹50,000; Kishore ₹50,000-₹5 lakh; Tarun ₹5-10 lakh; Tarun Plus ₹10-20 lakh (after repaying Tarun).",
     "https://www.mudra.org.in"),
    ("Pradhan Mantri Ujjwala Yojana", "PMUY", "प्रधानमंत्री उज्ज्वला योजना",
     "Deposit-free LPG connection for adult women of poor households.",
     "https://www.pmuy.gov.in"),
    ("Pradhan Mantri Jan Dhan Yojana", "PMJDY", "प्रधानमंत्री जन धन योजना",
     "Zero-balance bank account with RuPay debit card and accident insurance cover.",
     "https://pmjdy.gov.in"),
    ("Pradhan Mantri Jeevan Jyoti Bima Yojana", "PMJJBY", "प्रधानमंत्री जीवन ज्योति बीमा योजना",
     "Life cover of ₹2 lakh for ages 18-50, premium ₹436 per year via bank account.",
     "https://www.jansuraksha.gov.in"),
    ("Pradhan Mantri Suraksha Bima Yojana", "PMSBY", "प्रधानमंत्री सुरक्षा बीमा योजना",
     "Accident cover of ₹2 lakh (death/full disability) for ages 18-70, premium ₹20 per year.",
     "https://www.jansuraksha.gov.in"),
    ("Atal Pension Yojana", "APY", "अटल पेंशन योजना",
     "Guaranteed pension of ₹1,000-₹5,000 per month after 60; join between ages 18 and 40.",
     MYSCHEME_URL),
    ("Sukanya Samriddhi Yojana", "SSY", "सुकन्या समृद्धि योजना",
     "Small-savings account for a girl child, opened before she turns 10, at a post office or bank.",
     MYSCHEME_URL),
    ("Pradhan Mantri Matru Vandana Yojana", "PMMVY", "प्रधानमंत्री मातृ वंदना योजना",
     "Maternity benefit of ₹5,000 for the first child, paid by DBT.",
     "https://pmmvy.wcd.gov.in"),
    ("PM Street Vendor's AtmaNirbhar Nidhi", "PM SVANidhi", "पीएम स्वनिधि",
     "Collateral-free working-capital loans for street vendors, larger on timely repayment, plus digital-payment cashback.",
     "https://pmsvanidhi.mohua.gov.in"),
    ("PM Vishwakarma", "PM Vishwakarma", "पीएम विश्वकर्मा",
     "For traditional artisans in 18 trades: skill training, ₹15,000 toolkit incentive, collateral-free loans up to ₹3 lakh in two tranches.",
     "https://pmvishwakarma.gov.in"),
    ("National Scholarship Portal", "NSP", "राष्ट्रीय छात्रवृत्ति पोर्टल",
     "Single portal to apply for central and many state scholarships.",
     "https://scholarships.gov.in"),
    ("e-Shram", "e-Shram", "ई-श्रम",
     "National registration of unorganised workers; gives a UAN card and access to welfare schemes.",
     "https://eshram.gov.in"),
]


def reference_block(include_hindi: bool = False) -> str:
    # Hindi names are only added when replying in Hindi: Devanagari costs many tokens and
    # Groq's free tier allows only ~8k tokens per minute.
    lines = [
        f"- {name} ({code}){' / ' + hindi if include_hindi else ''}: {facts} {url}"
        for name, code, hindi, facts, url in SCHEMES
    ]
    header = "name (code)" + (" / official Hindi name" if include_hindi else "")
    return f"VERIFIED SCHEME REFERENCE ({header}: facts, official site):\n" + "\n".join(lines)
