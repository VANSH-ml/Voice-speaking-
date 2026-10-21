# PolyVoice AI — Smart Language Detection, Translation & Voice Studio

> Every Language. Every Story. One Voice.

A full-stack AI-powered application that automatically detects languages, translates text, and converts speech — all in one polished interface.

---

## Features

- **Automatic Language Detection** — Detects 75+ languages with confidence scoring via Lingua
- **Neural Translation** — Pluggable provider (Google, Microsoft, LibreTranslate, or mock)
- **Text-to-Speech** — Play original and translated text with speed & voice controls
- **Side-by-Side Comparison** — Compare original vs. translated text at a glance
- **Translation History** — Stored locally in browser localStorage
- **Text Insights** — Word/character/sentence count and reading time
- **Favorite Languages** — Quick-access commonly used languages
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Icons | Lucide React |
| Backend | Python 3.11 + FastAPI |
| Detection | lingua-language-detector |
| Translation | Configurable (Google / Microsoft / LibreTranslate / Mock) |
| TTS | Configurable (Google / Azure / ElevenLabs / Browser Web Speech API) |

---

## Quick Start

### 1. Clone & configure

```bash
git clone <repo>
cd polyvoice-ai
cp .env.example .env
# Edit .env with your API keys
```

### 2. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Provider Configuration

### Translation Providers

| Provider | Env Var | Notes |
|----------|---------|-------|
| `mock` | — | Works offline, returns dummy translation |
| `libre` | `LIBRE_TRANSLATE_URL`, `LIBRE_TRANSLATE_API_KEY` | Free/self-hostable |
| `google` | `GOOGLE_TRANSLATE_API_KEY` | Requires billing |
| `microsoft` | `AZURE_TRANSLATOR_KEY`, `AZURE_TRANSLATOR_REGION` | Requires Azure subscription |

### TTS Providers

| Provider | Env Var | Notes |
|----------|---------|-------|
| `browser` | — | Uses Web Speech API in the browser, no server audio |
| `mock` | — | Returns a silent placeholder |
| `google` | `GOOGLE_TTS_API_KEY` | High-quality neural voices |
| `azure` | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Neural voices |
| `elevenlabs` | `ELEVENLABS_API_KEY` | Ultra-realistic voices |

---

## API Endpoints

```
GET  /api/health
GET  /api/languages
POST /api/detect-language   { text }
POST /api/translate         { text, source_language, target_language }
POST /api/speech            { text, language, voice_id?, speed? }
POST /api/analyze-text      { text }
POST /api/summarize         { text, language }
```

---

## Project Structure

```
polyvoice-ai/
├── frontend/
│   └── src/
│       ├── components/    UI building blocks
│       ├── pages/         Route-level views
│       ├── hooks/         Custom React hooks
│       ├── services/      API client
│       ├── store/         Zustand global state
│       ├── types/         TypeScript interfaces
│       └── utils/         Helpers
└── backend/
    └── app/
        ├── api/           FastAPI route handlers
        ├── services/      Provider abstractions
        ├── schemas/       Pydantic models
        └── core/          Config & middleware
```
