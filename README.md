# AI Maritime Supply Decision Platform

> AI-powered maritime supply chain optimization for energy buyers.

## Quick Start

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

The cinematic landing page runs at port 3000 (via the original Python server or any static server).

```bash
python server.py     # serves landing page at http://localhost:3000
```

## API Keys (add after build)

Edit `.env` with your keys:

| Key | Service | Get it |
|-----|---------|--------|
| `GEMINI_API_KEY` | Gemini LLM | [aistudio.google.com](https://aistudio.google.com) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Database | [supabase.com](https://supabase.com) |
| `AISSTREAM_API_KEY` | Live vessel AIS | [aisstream.io](https://aisstream.io) |

**Without keys:** App runs fully in SIMULATED mode. All simulated data is clearly labelled.

## Demo Flow

1. Open `http://localhost:3000` → cinematic landing page
2. Click **"Start Analysis"** → redirects to `http://localhost:3001/intake`
3. Type: *"I need 2 million barrels of diesel to India in 7 days"*
4. Gemini parses → complete intake form
5. Click **"Discover Vessels"** → AIS candidates appear on map (labelled CANDIDATE — UNVERIFIED)
6. Click a vessel → **"Verify Commercial Opportunity"**
7. Enter: 20% capacity, USD 3,000,000 quote (lump sum)
8. Deal Evaluator shows: **GO / NEGOTIATE / REJECT** with full P&L
9. Use **What-If slider** to test different prices
10. Click **"Run Optimizer"** → OR-Tools produces ranked strategies
11. Click **"Explain"** → Gemini explains the result
12. Click **"Generate Report"** → executive decision report + download

## Architecture

```
Landing page (port 3000)    ← UNTOUCHED: Mostar cinematic scroll
                            ↓ CTA redirect
Frontend (port 3001)        ← Next.js 14 + Tailwind
  /intake                   ← 5-step guided intake + Gemini free text
  /map                      ← Leaflet network map + AIS vessel discovery  
  /deals/new                ← Human-verified deal entry
  /deals/[id]               ← Deterministic deal evaluator (GO/NEGOTIATE/REJECT)
  /strategy                 ← OR-Tools optimizer + ranked strategies
  /report                   ← Gemini executive report + download

Backend (port 8000)         ← FastAPI Python
  /api/intake/parse         ← Gemini parses free text
  /api/intake/save          ← Save validated scenario
  /api/vessels/discover     ← AIS + SIMULATED fallback
  /api/deals/               ← Create/get confirmed deals
  /api/evaluate/            ← Deterministic P&L + verdict
  /api/evaluate/whatif      ← What-if re-evaluation
  /api/optimize/            ← OR-Tools optimization
  /api/report/explain       ← Gemini explanation
  /api/report/generate      ← Gemini decision report
  /api/report/{id}/download ← Markdown download

Database                    ← Supabase (or in-memory demo)
  11 tables with provenance fields on every important number
```

## Data Provenance

Every number in the UI displays its provenance badge:

| Badge | Meaning |
|-------|---------|
| `CONFIRMED` | Human-entered, verified with counterparty |
| `REAL REFERENCE` | From official source (IEA, ADNOC, etc.) |
| `ESTIMATED` | Industry estimate or user assumption |
| `SIMULATED` | Demo/hackathon placeholder — not real |
| `CALCULATED` | Deterministic formula output |
| `CANDIDATE — UNVERIFIED` | AIS movement data only — capacity unknown |

## Supabase Setup

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.
Includes seed data for 16 ports, 5 pipelines, and reference prices.
