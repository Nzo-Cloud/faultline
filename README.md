# ⚡ Faultline

> Turn every bug you fix into portfolio content, automatically.

Faultline is a multi-agent AI system that takes a developer's error or stack trace, analyzes it through 5 sequential AI agents, and outputs a formatted Debug Log entry ready to publish to their portfolio.

**It is not a chatbot.** It is a developer documentation workflow tool powered by AI.

---

## The Problem

Developers fix bugs every day but rarely document what they learned. The knowledge disappears. Faultline captures it automatically as a structured Debug Log entry every time you fix a bug.

---

## How It Works

Paste any error or stack trace → 5 agents run sequentially → formatted Debug Log entry ready to copy.

```
[Classifier]  → Identifies error type and confidence
[Clarifier]   → Detects ambiguities, asks user to confirm before proceeding
[Analyzer]    → Deep root cause analysis
[Researcher]  → Finds known patterns and references
[Formatter]   → Outputs a structured Debug Log entry in markdown
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core (C#) |
| Frontend | Next.js (TypeScript) |
| AI (Local) | Ollama — llama3.1:8b |
| AI (Demo) | Groq API — llama-3.1-8b-instant |
| Styling | Tailwind CSS |

---

## Two Modes

**Local Mode (Ollama)** — fully offline, free forever, full privacy
```json
{ "Provider": "ollama" }
```

**Demo Mode (Groq)** — free tier, no credit card, fast
```json
{ "Provider": "groq" }
```

One config change to switch between them.

---

## Running Locally

### Backend
```bash
cd backend
cp .env.example .env
dotnet run
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Rate Limiting

Built-in protections to stay within Groq free tier:
- 1 analysis per 2 minutes per IP
- 5 analyses per hour per IP
- 10 analyses per day per IP
- Global concurrency lock (1 analysis at a time)
- Queue max size: 5 concurrent users

---

## Built By

**Lorenzo Balitian** — Junior Software Engineer  
BSIT Graduate, May 2026 | Davao, Philippines  
GitHub: [Nzo-Cloud](https://github.com/Nzo-Cloud) | Portfolio: [lorenzobalitian.vercel.app](https://lorenzobalitian.vercel.app)

---

## Project Status

🟢 Live — [https://faultline-nzo.vercel.app](https://faultline-nzo.vercel.app)