# AI Maritime Supply Decision Platform

> AI-powered maritime supply chain optimization for energy buyers.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnaagasumukh8%2FBUILD-EON-EXEA)

## 🌐 Live Vercel Deployment

- **Vercel Web App URL:** [https://build-eon-exea.vercel.app](https://build-eon-exea.vercel.app)
- **GitHub Repository:** [https://github.com/naagasumukh8/BUILD-EON-EXEA](https://github.com/naagasumukh8/BUILD-EON-EXEA)

---

## 💻 Multi-Laptop Sync Workflow (HP & ACER)

When switching between your **HP** and **ACER** laptops:

1. **Pull Latest Code on ACER / HP:**
   ```bash
   git pull origin main
   ```
2. **Setup Local Environment (`.env`):**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Populate `.env` with your `GEMINI_API_KEY`, `SUPABASE_SERVICE_KEY`, and `AISSTREAM_API_KEY`.
3. **Run Local Servers:**
   - **Backend (FastAPI):** `cd backend && python main.py` (port 8000)
   - **Frontend (Next.js):** `cd frontend && npm run dev` (port 3001)
   - **Landing Page:** `python server.py` (port 3000)

---

## 🚀 Vercel Deployment Instructions

1. Import repository `naagasumukh8/BUILD-EON-EXEA` into Vercel Dashboard.
2. Select Framework Preset: **Next.js**.
3. Set Root Directory to `./` or `./frontend`.
4. Add environment variables in Vercel settings:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-api.com` (or `http://localhost:8000` for local dev)

`vercel.json` configuration is included in the repository root for automated Vercel builds.

---

## Quick Start (Local Development)

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
# Copy environment template and fill in keys
cp ../.env.example ../.env
# Start backend (port 8000)
python main.py
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev          # starts on port 3001
```

### 3. Landing Page

The cinematic landing page runs at port 3000:

```bash
python server.py     # serves landing page at http://localhost:3000
```

---

## API Keys Configuration

Edit `.env` with your keys:

| Key | Service | Get it |
|-----|---------|--------|
| `GEMINI_API_KEY` | Gemini LLM | [aistudio.google.com](https://aistudio.google.com) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Database | [supabase.com](https://supabase.com) |
| `AISSTREAM_API_KEY` | Live vessel AIS | [aisstream.io](https://aisstream.io) |

**Without keys:** App runs fully in SIMULATED mode. All simulated data is clearly labelled.

---

## Complete Demo Flow

1. Open `http://localhost:3000` (or Vercel app link) → cinematic landing page.
2. Click **"Start Analysis"** → redirects to Next.js intake (`/intake`).
3. Type: *"I need 2 million barrels of diesel delivered to India within 7 days."*
4. Gemini parses requirements into structured scenario chips.
5. Click **"Launch Network Map"** → AIS vessel candidates appear on interactive Leaflet map canvas (`CANDIDATE_UNVERIFIED`).
6. Click a vessel → **"Verify Commercial Opportunity"**.
7. Enter: 20% capacity, USD 3,000,000 quote.
8. Deal Evaluator shows: **GO / NEGOTIATE / REJECT** with full P&L.
9. Use **What-If slider** to test different price quotes in real time.
10. Click **"Run Strategy Optimizer"** → OR-Tools computes optimal hybrid allocation (vessel / pipeline / alternate route).
11. Click **"Generate Gemini Rationale"** → AI explains the solver decision.
12. Click **"Generate Decision Report"** → executive briefing format + download (.md).

---

## Data Provenance Badges

Every number in the UI displays its provenance badge:

| Badge | Meaning |
|-------|---------|
| `CONFIRMED` | Human-entered, verified commercial terms |
| `REAL REFERENCE` | Official benchmark (IEA, ADNOC, SUMED) |
| `ESTIMATED` | Industry estimate or user assumption |
| `SIMULATED` | Demo/hackathon fallback data |
| `CALCULATED` | Deterministic formula output |
| `CANDIDATE_UNVERIFIED` | Raw AIS positioning data |

---

## Database Setup (Supabase)

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.
Includes seed data for 16 ports, 5 pipelines, and reference commodity pricing.
