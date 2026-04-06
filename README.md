# 🏛️ JanSaathi AI — आपका सरकारी साथी

> **Hackathon-ready, production-grade AI assistant for Indian citizens to discover and apply for government schemes.**

![JanSaathi](https://img.shields.io/badge/JanSaathi-v1.0-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=for-the-badge&logo=fastapi)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧞‍♀️ **Genie Intro** | Chirag lamp animation with genie appearing on first load |
| 🌐 **4 Languages** | Hindi, English, Punjabi, Gujarati with full TTS voice guidance |
| 👤 **Avatar (Saathi)** | Animated female avatar with lip-sync, blink, breathing |
| 🏛️ **Scheme Matching** | AI-powered government scheme recommendations |
| 💬 **AI Chat** | Multilingual conversational AI assistant |
| 🛡️ **Doc Verification** | Check document eligibility for schemes |
| 🔔 **Notifications** | Scheduled scheme alerts and reminders |
| 🎤 **Voice Input** | Speech-to-text in all 4 languages |
| 📱 **Mobile-first** | Bottom nav, responsive, touch-optimized |

---

## 🏗️ Repository Structure

```
jansaathi-ai/
│
├── frontend/                    # React + Tailwind + Framer Motion
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.tsx       # Animated female avatar (fixed hair)
│   │   │   ├── GenieIntro.tsx   # Chirag lamp + genie animation
│   │   │   ├── LanguageSelect.tsx # Big-button language picker
│   │   │   ├── ActionSelect.tsx  # Icon-based action picker
│   │   │   ├── ProfileForm.tsx   # Multilingual profile form
│   │   │   ├── SchemeList.tsx    # Expandable scheme cards
│   │   │   ├── NotificationPanel.tsx
│   │   │   └── Logo.tsx         # Clean govt-friendly logo
│   │   ├── services/
│   │   │   ├── gemini.ts        # AI API calls
│   │   │   ├── tts.ts           # Text-to-speech (female voice)
│   │   │   └── storage.ts       # LocalStorage persistence
│   │   ├── pages/               # (extensible)
│   │   ├── types.ts             # TypeScript types + demo data
│   │   ├── App.tsx              # Main app with full UX flow
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py          # Chat endpoints
│   │   │   ├── schemes.py       # Scheme matching + verification
│   │   │   ├── notifications.py # Notification CRUD
│   │   │   ├── profile.py       # Profile management
│   │   │   └── health.py        # Health check
│   │   ├── services/
│   │   │   └── ai_service.py    # Gemini AI integration
│   │   ├── models/
│   │   │   └── models.py        # Pydantic models
│   │   ├── utils/
│   │   │   └── storage.py       # JSON file store
│   │   └── main.py              # FastAPI app entry
│   ├── data/                    # Auto-created JSON data files
│   └── requirements.txt
│
├── notification-engine/         # Standalone notification scheduler
│   ├── worker.py                # Main worker loop
│   └── scheduler.py             # Schedule rules
│
├── docs/                        # Documentation
├── .env.example                 # Environment variables template
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Gemini API key ([get here](https://aistudio.google.com/app/apikey))

### 1. Clone & Setup Environment
```bash
git clone <repo>
cd jansaathi-ai
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 2. Frontend Setup
```bash
cd frontend
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
npm run dev
# App runs at http://localhost:3000
```

### 3. Backend Setup (optional — frontend works standalone)
```bash
cd backend
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
python -m uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### 4. Notification Engine (optional)
```bash
cd notification-engine
python worker.py
```

---

## 🎭 Demo Flow

1. **Open app** → Chirag lamp glows → Genie (Saathi) emerges with welcome speech
2. **Language Screen** → 4 big buttons with voice reading options aloud
3. **Action Screen** → Icon-based: Ask JanSaathi / Update Profile / Dashboard
4. **Dashboard** → Avatar greets in selected language (female voice)
5. **Profile** → Fill details → AI finds matching schemes
6. **Chat** → Ask in Hindi/English/Punjabi/Gujarati → Voice response
7. **Verify** → Check if your documents qualify for a scheme

---

## 🧪 Demo Data

The app includes built-in demo data (no API key needed to start):
- 5 sample government schemes (PM-Kisan, Ayushman Bharat, etc.)
- 4 demo notifications
- Pre-populated scheme cards

Set `GEMINI_API_KEY` to enable live AI responses.

---

## 🌐 Supported Languages

| Language | Code | TTS | STT | UI |
|----------|------|-----|-----|-----|
| English  | `en` | ✅  | ✅  | ✅  |
| Hindi    | `hi` | ✅  | ✅  | ✅  |
| Punjabi  | `pa` | ✅  | ✅  | ✅  |
| Gujarati | `gu` | ✅  | ✅  | ✅  |

---

## 🎨 Design System

- **Primary**: Saffron (#FF6B35) → Amber (#F59E0B) gradient
- **Background**: Warm cream (#FBF8F4)
- **Font**: Baloo 2 (display) + Inter (body) + Noto Sans Devanagari (Indian scripts)
- **Radius**: 24px+ rounded cards (friendly, approachable)
- **Motion**: Framer Motion for all transitions and the genie animation

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | AI chat response |
| POST | `/api/schemes/match` | Match schemes to profile |
| POST | `/api/schemes/verify` | Verify document eligibility |
| GET  | `/api/schemes/demo` | Get demo schemes |
| GET  | `/api/notifications/` | List notifications |
| PATCH| `/api/notifications/{id}/read` | Mark as read |
| GET  | `/api/profile/` | Get profile |
| POST | `/api/profile/` | Save profile |
| GET  | `/api/health` | Health check |

---

## 🔮 Roadmap / Bonus Features

- [ ] Offline PWA with service worker
- [ ] WhatsApp integration for notifications
- [ ] Camera-based document scanner
- [ ] More regional languages (Tamil, Telugu, Bengali, Marathi)
- [ ] Government portal deep links
- [ ] Scheme application status tracker

---

## 🏆 Built With

- **Frontend**: React 19, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Backend**: FastAPI, Pydantic v2, Google Gemini AI
- **Storage**: JSON file-based (no database needed)
- **Voice**: Web Speech API (TTS + STT, browser-native)
- **Animations**: Pure CSS + Framer Motion + SVG

---

*JanSaathi — Bridging the gap between Indian citizens and government schemes* 🇮🇳
