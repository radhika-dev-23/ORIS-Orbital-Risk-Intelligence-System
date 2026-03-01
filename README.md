# 🛰 ORIS — Orbital Risk Intelligence System

> Air Traffic Control for Space — AI-powered orbital debris tracking, collision detection, and maneuver optimization.

---

## 📁 Project Structure

```
oris/
├── frontend/               ← React + Vite app
│   ├── public/             ← Static assets (favicon, etc.)
│   ├── src/
│   │   ├── components/     ← All UI components
│   │   ├── hooks/          ← Custom React hooks
│   │   ├── utils/          ← Physics, math, helpers
│   │   └── styles/         ← Global CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                ← Python Flask API
│   ├── app.py              ← Main server
│   ├── simulation.py       ← Orbital physics engine
│   ├── collision.py        ← Collision detection
│   ├── clustering.py       ← Debris cluster analysis
│   ├── forecasting.py      ← Risk forecasting (Monte Carlo)
│   ├── requirements.txt
│   └── .env.example
│
├── ai/                     ← AI layer (Claude integration)
│   ├── analyzer.py         ← Risk analysis prompts
│   ├── maneuver.py         ← Maneuver optimization
│   └── report.py           ← Report generation
│
├── package.json            ← Root scripts (run both servers)
└── README.md
```

---

## 🚀 Quick Start

### 1. Install everything
```bash
npm run install:all
```

### 2. Set your API key
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your ANTHROPIC_API_KEY
```

### 3. Run both servers
```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## 🧠 AI Features

The AI layer uses Claude (Anthropic) to:
- Analyze collision risk in real-time
- Suggest orbital maneuvers with exact km values
- Generate PDF-ready mission reports
- Predict Kessler cascade probabilities

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Canvas 2D |
| Backend | Python 3.11, Flask, NumPy |
| AI | Anthropic Claude API |
| Physics | NumPy orbital mechanics |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/simulate` | Get current orbital state |
| POST | `/api/analyze` | Run AI risk analysis |
| POST | `/api/maneuver` | Apply orbital maneuver |
| POST | `/api/report` | Generate mission report |
| GET | `/api/forecast` | Get 24h risk forecast |
| POST | `/api/reset` | Reset simulation |
