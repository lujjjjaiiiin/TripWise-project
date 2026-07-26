# TripWise AI — Local Setup Guide

TripWise AI is a full-stack AI travel recommendation product.  
It uses **K-Means + Cosine Similarity** across 316 destinations, 9 preference dimensions, and 7 world regions.

---

## Project Structure

```
TripWise_AI_Final/
├── artifacts/
│   ├── api-server/          ← Python FastAPI backend (ML engine)
│   │   ├── main.py          ← FastAPI app entry point
│   │   ├── recommendation.py← Cosine similarity + diversity logic
│   │   ├── data_loader.py   ← Dataset loading + model fitting
│   │   ├── airport_fallback.py ← 105-city IATA fallback dictionary
│   │   ├── data/
│   │   │   └── tripwise_data.csv ← 316-destination dataset
│   │   ├── requirements.txt
│   │   └── start.sh
│   └── tripwise/            ← React + Vite frontend
│       ├── src/
│       │   ├── pages/       ← home, planner, explore, about
│       │   ├── components/  ← UI + animations
│       │   └── lib/         ← i18n, translations (EN + AR)
│       ├── public/          ← favicon.svg
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
├── lib/
│   ├── api-client-react/    ← React Query hooks for the API
│   ├── api-spec/            ← OpenAPI spec (openapi.yaml)
│   ├── api-zod/             ← Zod validation schemas
│   └── db/                  ← Database schema (Drizzle)
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json
└── tsconfig.base.json
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Python | ≥ 3.11 | https://python.org |
| uv or pip | any | `pip install uv` (optional) |

---

## 1 — Install Python dependencies (Backend)

```bash
cd artifacts/api-server
pip install -r requirements.txt
```

Or with uv:

```bash
cd artifacts/api-server
uv pip install -r requirements.txt
```

**Dependencies:**
- `fastapi==0.111.0`
- `uvicorn[standard]==0.29.0`
- `pydantic==2.7.1`
- `pandas==2.2.2`
- `numpy==1.26.4`
- `scikit-learn==1.4.2`
- `python-multipart==0.0.9`

---

## 2 — Install Node.js dependencies (Frontend + shared libs)

From the **project root**:

```bash
pnpm install
```

This installs all packages for the frontend, API client, and shared libraries.

---

## 3 — Run the Backend (API Server)

```bash
cd artifacts/api-server
PORT=8080 uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

Or use the provided start script:

```bash
cd artifacts/api-server
PORT=8080 bash start.sh
```

The API will be available at: **http://localhost:8080**

API docs: **http://localhost:8080/docs**

---

## 4 — Run the Frontend (React App)

In a separate terminal, from the project root:

```bash
pnpm --filter @workspace/tripwise run dev
```

The app will be available at: **http://localhost:5173** (or whichever port Vite picks)

> **Note:** The frontend connects to the backend using the `VITE_API_BASE_URL` environment variable.  
> Create `artifacts/tripwise/.env.local`:
> ```
> VITE_API_BASE_URL=http://localhost:8080
> ```

---

## Key Features

- **AI Recommendations** — Cosine similarity scoring across 316 cities, 9 preference dimensions
- **Region Filtering** — 7 world regions (Africa, Asia, Europe, Middle East, North America, Oceania, South America)
- **Airport Lookup** — Real IATA codes with 105-city fallback dictionary
- **Interactive Map** — Leaflet.js map showing all recommended destinations
- **Opening Animation** — Airplane cabin animation (plays once per session via sessionStorage)
- **Arabic Support** — Full RTL layout + translation for all content
- **What You'll Get** — Preview panel in the planner showing expected output
- **Loading Reveal** — 4-step animated loading sequence when generating recommendations

---

## ML Architecture

```
User Preferences (9 dimensions + budget + temp + hotel rating)
        ↓
  StandardScaler (fitted on dataset at startup)
        ↓
  Cosine Similarity (vs all 316 destinations)
        ↓
  Cluster Diversity Cap (K-Means, max 3 per cluster)
        ↓
  Region Filter (optional)
        ↓
  Top N Recommendations (default: 10)
```

---

## Translation System

Translations live in `artifacts/tripwise/src/lib/translations.ts`.

To add a new language:
1. Add a new key block alongside `en` and `ar`
2. Update `artifacts/tripwise/src/lib/i18n.tsx` to include the new language code
3. Add a language toggle button in `artifacts/tripwise/src/components/Navbar.tsx`

---

## Build for Production

**Frontend (static build):**
```bash
pnpm --filter @workspace/tripwise run build
# Output: artifacts/tripwise/dist/
```

**Backend:**  
The Python backend runs directly — no build step needed.  
For production, consider running with Gunicorn:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8080
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ModuleNotFoundError` on startup | Run `pip install -r requirements.txt` in `artifacts/api-server/` |
| Frontend shows no recommendations | Check backend is running on port 8080 and `VITE_API_BASE_URL` is set |
| Map not loading | Leaflet CSS is loaded from CDN — check internet connection |
| Arabic layout broken | Ensure `dir="rtl"` is applied; check `i18n.tsx` language state |
| Intro animation replays | It uses `sessionStorage["intro_shown"]` — only replays on new browser sessions |

---

*TripWise AI — AI-powered travel recommendation system*  
*Built with FastAPI + React + Vite + Tailwind CSS + Framer Motion*
