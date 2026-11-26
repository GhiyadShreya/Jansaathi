# Deploying JanSaathi

Assumed setup: **backend on Render (Docker)**, **frontend on Vercel**. Any host that runs a
Dockerfile and any static host work the same way; only where you click changes.

## 1. Backend (Render → New → Web Service)

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Runtime | Docker (uses `backend/Dockerfile`, which installs Tesseract for OCR) |
| Health check path | `/api/health` |
| Persistent disk | mount at `/var/data` (needs a paid instance; without it, data resets on every deploy) |

Environment variables (copy names from `backend/.env.example`):

- `GROQ_API_KEY`: **required in production**. Ollama is only a fallback and won't exist on the host.
- `GROQ_MODEL=openai/gpt-oss-120b` (also the code default). Groq retires models; if chat starts
  failing with a 404, pick a current one from `https://api.groq.com/openai/v1/models`.
- `SPEAKATOO_*`: all of them, same as your local `backend/.env`.
- `ALLOWED_ORIGINS=https://<your-frontend>.vercel.app`
- `DATA_DIR=/var/data`

Check: `https://<backend>.onrender.com/api/health` should return `"ai_configured": true`.

## 2. Frontend (Vercel → New Project)

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Env var | `VITE_API_URL=https://<backend>.onrender.com` |

`VITE_API_URL` is baked in **at build time**, so redeploy the frontend after changing it.
Do **not** put any secret in a `VITE_*` variable: everything prefixed `VITE_` ends up in the public JS.

## 3. Then

1. Put the final frontend URL into the backend's `ALLOWED_ORIGINS` and redeploy the backend.
2. Open the site and test chat, TTS playback, and document upload (OCR).

## Known limitations still in the code

- **Groq free tier allows ~8,000 tokens per minute**, which is about 3-4 chat messages per minute
  across all users. Beyond that, requests fail. Use a paid Groq plan for real traffic.
- **AI answers are checked, not guaranteed.** Numbers not found in
  `backend/app/services/scheme_reference.py` are removed automatically, but wording can still be
  wrong. Keep that file's facts current; the chat shows a disclaimer.
- **Python version:** Docker uses 3.11. Locally, use 3.11 or 3.12; the pinned Pillow 10.4 has no
  wheels for 3.13+.

- **All visitors share one profile and chat history.** The backend stores everything under
  `user_id="default"`. Fine for a demo; for real users the frontend must send a per-user id.
- **JSON-file storage** works for one server instance only. Move to a database before scaling.
