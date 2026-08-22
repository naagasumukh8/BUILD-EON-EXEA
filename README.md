# POLY EXEA — AI Maritime Supply Decision Platform

> **When a critical maritime oil supply route breaks, most buyers know one move. POLY EXEA finds the other nineteen.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnaagasumukh8%2FBUILD-EON-EXEA)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google OR-Tools](https://img.shields.io/badge/Google-OR--Tools-4285F4?style=flat&logo=google)](https://developers.google.com/optimization)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-8E75C2?style=flat&logo=google)](https://aistudio.google.com/)

---

## 🌐 Live Product & Resources

- 🚀 **Live Web App:** [https://build-eon-exea.vercel.app](https://build-eon-exea.vercel.app)
- 🎬 **Watch Demo Video:** [Google Drive Demo Recording](https://drive.google.com/file/d/1tT0dmzhF2pGDpCeXixenK81ioJpk4CFn/view?usp=sharing)
- 📄 **20-Strategy Playbook (PDF):** [Poly_Exea_Mumbai_Real_World_Strategy_Examples.pdf](./public/Poly_Exea_Mumbai_Real_World_Strategy_Examples.pdf)
- 💻 **GitHub Repository:** [https://github.com/naagasumukh8/BUILD-EON-EXEA](https://github.com/naagasumukh8/BUILD-EON-EXEA)

---

## 📌 The Problem

When critical choke points like the **Strait of Hormuz** (which moves ~20% of global petroleum) or the **Red Sea / Bab-el-Mandeb** close, most energy buyers default to a single costly move: **rerouting around the Cape of Good Hope**. 

- Adds **+14 to +20 days** of transit time.
- Adds **+$12 to +$18 per barrel** in landed fuel, war risk insurance, and freight costs.
- Refineries hit catastrophic inventory drawdown within **4–7 days** without an optimized contingency plan.

**POLY EXEA** dynamically scans and calculates **20 distinct physical and commercial strategy options** across 4 families, returning deterministically verified, cost-optimal solutions in minutes rather than days.

---

## ⚡ 20 Strategy Matrix (4 Commercial Families)

| Family | Core Strategies | Real-World Application |
|---|---|---|
| **1. Move Differently** | Petroline / IPSA Pipeline Bypass, STS Transfer in Gulf of Oman, Cape of Good Hope Reroute | Offload before choke point, pipeline across Saudi Arabia / UAE to Red Sea terminals |
| **2. Don't Move Your Cargo** | Strategic Inventory Swap, SPR / Commercial Stock Draw, Regional Refining Partner Exchange | Swap East-of-Suez cargo entitlement for West-of-Suez barrels without moving physical oil |
| **3. Use the Network** | Divert Transiting VLCCs, Backhaul Capacity Utilization, Closed-Loop Triangulation | Capture spare capacity on empty return legs or re-route uncommitted vessels mid-ocean |
| **4. Change Timing & Mode** | Alternate Discharge Hubs, Multi-Modal Rail/Barge, Wait-and-Bypass Economics | Stage inventory at intermediate deepwater hub (e.g., Fujairah, Salalah, Mundra) |

---

## 🏗️ Technical Architecture

```
                                  USER REQUIREMENT
                               (Natural Language Prompt)
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   Next.js 14 Web Application    │
                         │   (App Router, Leaflet Canvas)  │
                         └────────────────┬────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
       ┌───────────────────────────┐             ┌───────────────────────────┐
       │   FastAPI Decision Engine │             │   Gemini 1.5/2.0 AI       │
       │   (Python 3.10+)          │             │   (Intake Parser +        │
       └─────────────┬─────────────┘             │    Decision Rationale)    │
                     │                           └───────────────────────────┘
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐   ┌──────────────────────────┐
│  Google OR-Tools │   │  Live AIS Stream Engine  │
│  (Deterministic  │   │  (aisstream.io WebSocket │
│   Solver & LP)   │   │   + 16 Global Seaports)  │
└────────┬─────────┘   └─────────┬────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
       ┌───────────────────────────┐
       │  Supabase (PostgreSQL)    │
       │  (16 Ports, 5 Pipelines,  │
       │   Historical Benchmarks)  │
       └───────────────────────────┘
```

### Core Tenets:
1. **Deterministic Optimization:** Google OR-Tools computes the exact barrel allocations, logistics costs, and P&L. AI explains the rationale — it *never* invents financial numbers.
2. **Strict Data Provenance:** Every single metric in the platform is badged with its origin (`CONFIRMED`, `REAL REFERENCE`, `ESTIMATED`, `CALCULATED`, `CANDIDATE_UNVERIFIED`).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js 18+** & **npm**
- **Python 3.10+** & **pip**
- (Optional) API Keys for Gemini, Supabase, and AISStream

### 2. Clone and Setup
```bash
git clone https://github.com/naagasumukh8/BUILD-EON-EXEA.git
cd BUILD-EON-EXEA

# Configure environment variables
cp .env.example .env
```

### 3. Start Frontend (Next.js 14)
```bash
npm install
npm run dev
# Running on http://localhost:3001
```

### 4. Start Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
# Running on http://localhost:8000 (Swagger docs: http://localhost:8000/api/docs)
```

---

## 🔑 Environment Configuration (`.env`)

| Variable | Service | Description |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | Natural language intake parser & strategy briefings |
| `SUPABASE_URL` | Supabase | PostgreSQL database URL |
| `SUPABASE_SERVICE_KEY` | Supabase | Database access key for ports, routes, and vessel tables |
| `AISSTREAM_API_KEY` | AISStream.io | Live real-time maritime AIS satellite vessel tracking |

> **Note:** The application includes full deterministic offline simulation fallbacks if API keys are not provided.

---

## 🧪 Verification & Golden Test Scenarios

Run automated test scenarios and logic assertions:
```bash
# Run comprehensive core test suite
pytest backend/tests/test_poly_exea_core.py -v

# Run golden scenario verifications
python run_golden_scenarios.py
python final_scenario_validation.py
```

---

## 🛡️ Data Provenance System

| Provenance Badge | Description |
|---|---|
| `CONFIRMED` | Human-entered and verified commercial terms |
| `REAL REFERENCE` | Benchmark pricing / capacity from official authorities (IEA, ADNOC, SUMED) |
| `CALCULATED` | Deterministic mathematical output from Google OR-Tools solver |
| `CANDIDATE_UNVERIFIED` | Raw AIS vessel position data requiring commercial verification |
| `ESTIMATED` | Industry standard operational estimate |
| `SIMULATED` | Fallback simulation data clearly marked for auditability |

---

## 📄 License & Author

- **Author:** Naaga Sumukh B S
- **License:** MIT License
