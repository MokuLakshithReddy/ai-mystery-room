# 🔍 AI Mystery Room

> An interactive, AI-driven detective investigation web application where users create, investigate, and solve murder mysteries dynamically synthesized with Gemini.

---

## 🌐 Live Production Deployments
- **Web App (Frontend)**: [https://client-tau-sable-95.vercel.app](https://client-tau-sable-95.vercel.app)
- **REST API (Backend)**: [https://server-beta-blond-45.vercel.app](https://server-beta-blond-45.vercel.app)
- **API Healthcheck**: [https://server-beta-blond-45.vercel.app/api/health](https://server-beta-blond-45.vercel.app/api/health)

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Zero-Spoiler Security Model](#-zero-spoiler-security-model)
- [Difficulty & Scoring System](#-difficulty--scoring-system)
- [API Reference](#-api-reference)
- [Local Development Setup](#-local-development-setup)
- [Deployment Instructions](#-deployment-instructions)

---

## 🕵️ Project Overview
**AI Mystery Room** places the player in the role of a lead detective handling high-stakes crimes (e.g. poisoning at high-society galas, cybernetic sabotage, locked-room heists).

Unlike static murder-mystery games, every case is generated dynamically with structured logic ensuring:
1. **Solvable Fair-Play Whodunits**: The culprit is among the suspects, clues logically point to them, and alibis can be cross-referenced.
2. **Zero-Knowledge Backend Isolation**: The secret solution, guilt breakdown, and perpetrator identity are never transmitted to the client until formal accusation.
3. **Interactive Investigation**: Uncover physical clues, request forensic hints, calculate deduction points in real time, and file an official warrant.

---

## 🛠️ Architecture & Tech Stack

### Frontend (`/client`)
- **React 19 & Vite 8**: Ultra-fast SPA with Hot Module Replacement.
- **Tailwind CSS v4**: Atmospheric noir detective palette (slate/amber/crimson) with custom scanner beams, glowing evidence badges, and glassmorphism.
- **React Router DOM v7**: Seamless navigation between Command Desk, Case Dispatcher, Investigation Room, and Results.
- **Axios**: Configured client with centralized error interception.
- **Lucide Icons**: Contextual detective iconography (fingerprint, magnifying glass, shield, skull, target).

### Backend (`/server`)
- **Node.js & Express**: High-performance RESTful API with CORS and JSON parsing.
- **MongoDB & Mongoose**: Object document mapping with custom security projection (`select: false` on solutions).
- **Google Gen AI (`@google/genai`)**: Structured JSON outputs using `gemini-2.5-flash`.
- **Zod**: Runtime schema validation of generated cases and client payloads.
- **Smart Fallback Engine**: Ensures 100% playable uptime even when API keys are not supplied.

---

## 🔒 Zero-Spoiler Security Model
1. **Model Projection Masking**: The `solution` schema field in Mongoose has `{ select: false }`. It is never loaded by default queries.
2. **Clue Concealment**: Unexamined clues only transmit their general location. Detailed descriptions remain hidden on the server until the player inspects the evidence sector.
3. **Locked Hints**: Hint texts are masked until the player deliberately requests a declassification (-10 pts penalty).
4. **Permanent Sealing**: Accusations are irreversible once filed. Once submitted, the backend unseals the verdict, solution breakdown, and score breakdown.

---

## 🎯 Difficulty & Scoring System

| Difficulty | Suspects | Clues | Hints | Base Bounty |
| :--- | :--- | :--- | :--- | :--- |
| **Easy** | 3 | 5 | 2 | 100 pts |
| **Medium** | 4 | 7 | 3 | 150 pts |
| **Hard** | 5 | 9 | 3 | 200 pts |

### Scoring Formula:
$$\text{Total Score} = \max\left(0, (\text{Correct ? Base Bounty} : 0) + (5 \times \text{Discovered Clues}) - (10 \times \text{Hints Used})\right)$$

- **Honorary Detective Ranks**:
  - `180+ pts`: Grand Master Detective (Sherlock)
  - `130 - 179 pts`: Senior Inspector
  - `70 - 129 pts`: Field Investigator
  - `0 - 69 pts`: Rookie Sleuth

---

## 📡 API Reference

### Cases
- `POST /api/cases` — Generate a new mystery case (Body: `{ premise, difficulty }`).
- `GET /api/cases/:id` — Retrieve active sanitized case file.
- `POST /api/cases/:id/clues/:clueId/discover` — Examine evidence and claim +5 points.
- `POST /api/cases/:id/hints` — Unlock next forensic hint with a -10 point penalty.
- `POST /api/cases/:id/accuse` — Submit official accusation (Body: `{ suspectId, rationale }`).
- `GET /api/cases/:id/result` — Retrieve full declassified case solution and scorecard.
- `GET /api/cases` — List recent open/closed cases.
- `GET /api/health` — Service healthcheck and database connectivity.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v18+ LTS
- Local MongoDB running on `mongodb://127.0.0.1:27017`

### 2. Backend Setup
```bash
cd server
npm install
# Configure server/.env
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment
Both frontend and backend are configured for zero-config Vercel deployment:
- **Client**: `npx vercel --prod`
- **Server**: `npx vercel --prod`
