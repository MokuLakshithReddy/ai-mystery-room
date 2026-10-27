# 🔍 AI Mystery Room

> An interactive, AI-driven detective investigation web application where users create, investigate, and solve murder mysteries dynamically synthesized with Gemini.

---

## 🌐 Live Production Deployments
- **Web App (Frontend)**: [https://client-tau-sable-95.vercel.app](https://client-tau-sable-95.vercel.app)
- **REST API (Backend)**: [https://server-beta-blond-45.vercel.app](https://server-beta-blond-45.vercel.app)
- **API Health Check**: [https://server-beta-blond-45.vercel.app/api/health](https://server-beta-blond-45.vercel.app/api/health)
- **GitHub Repository**: [https://github.com/MokuLakshithReddy/ai-mystery-room](https://github.com/MokuLakshithReddy/ai-mystery-room)

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Zero-Spoiler Security Model](#-zero-spoiler-security-model)
- [Difficulty & Scoring System](#-difficulty--scoring-system)
- [API Reference](#-api-reference)
- [Automated Testing](#-automated-testing)
- [Local Development Setup](#-local-development-setup)
- [Deployment Instructions](#-deployment-instructions)
- [Project Documentation](#-project-documentation)

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
- **Vitest & React Testing Library**: Component testing suite.

### Backend (`/server`)
- **Node.js & Express**: High-performance RESTful API with strict CORS origin verification and JSON parsing.
- **MongoDB & Mongoose**: Object document mapping with custom security projection (`select: false` on solutions).
- **Google Gen AI (`@google/genai`)**: Structured JSON outputs using `gemini-2.5-flash`.
- **Zod & Custom Validator**: Strict schema, referential integrity, and evidence-trail validation (`validateMystery`).
- **Vitest & Supertest**: Full automated unit and integration test suite (48 tests).
- **Durable Persistence & Concurrency Locks**: Enforces durable persistence before returning success; uses `withCaseLock` mutex to prevent race conditions.

---

## 🔒 Zero-Spoiler Security Model
1. **Model Projection Masking**: The `solution` schema field in Mongoose has `{ select: false }`. It is never loaded by default queries.
2. **Clue Concealment**: Unexamined clues only transmit their general location. Detailed descriptions remain hidden on the server until the player inspects the evidence sector.
3. **Locked Hints**: Hint texts are masked until the player deliberately requests a declassification (-10 pts penalty).
4. **Permanent Sealing**: Accusations are irreversible once filed. Once submitted, the backend unseals the verdict, solution breakdown, and score breakdown.
5. **Strict CORS**: Production endpoints verify browser origins and reject unauthorized origins with HTTP 403.

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

## 🧪 Automated Testing

### Running Backend Tests (48 Passing Tests)
```bash
cd server
npm test
```
Covers:
- `mysteryValidator.test.js`: Exact suspect/clue/hint counts, ID uniqueness, culprit cross-referencing, evidence trail, spatial diversity.
- `scoring.test.js`: Direct testing of production `calculateScore` from `CaseStore.js`.
- `secrecy.test.js`: Active case sanitization, solution masking, clue description concealment.
- `persistenceFailure.test.js`: Asserts `DURABLE_PERSISTENCE_FAILED` when durable stores are unavailable.
- `casesApi.test.js`: Full integration suite testing all endpoints, CORS allow/reject, concurrency locks, and error codes.

### Running Frontend Tests (4 Passing Tests)
```bash
cd client
npm test
```
Covers:
- `ScoreBadge.test.jsx`: Accurate rendering of score badges and ranks.
- `ClueCard.test.jsx`: Discovered vs undiscovered state, examine action triggering.

---

## 📡 API Reference

### Cases
- `POST /api/cases` — Generate a new mystery case (Body: `{ premise, difficulty }`). Validates premise (5-300 characters) and difficulty (`easy`, `medium`, `hard`).
- `GET /api/cases/:id` — Retrieve active sanitized case file (solution stripped, unexamined clue descriptions masked).
- `POST /api/cases/:id/clues/:clueId/discover` — Examine evidence and claim +5 points (idempotent).
- `POST /api/cases/:id/hints` — Unlock next forensic hint with a -10 point penalty.
- `POST /api/cases/:id/accuse` — Submit official accusation (Body: `{ suspectId, rationale }`).
- `GET /api/cases/:id/result` — Retrieve full declassified case solution and scorecard.
- `GET /api/cases` — List recent open/closed cases.
- `GET /api/health` — Service healthcheck, database status, and AI provider status.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v18+ LTS
- Local MongoDB running on `mongodb://127.0.0.1:27017` (or cloud store)

### 2. Backend Setup
```bash
cd server
npm install
npm test
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm test
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📚 Project Documentation
- [`SPEC.md`](SPEC.md) — Technical Specification Document & Architectural Blueprint
- [`TESTING.md`](TESTING.md) — Comprehensive Test Guide & Acceptance Matrix
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — Production Setup & Cloud Configuration
- [`SECURITY.md`](SECURITY.md) — Zero-Knowledge Security Policy & Data Isolation
- [`AI_MYSTERY_ROOM_COMPLETION_PLAN.md`](AI_MYSTERY_ROOM_COMPLETION_PLAN.md) — Verified Completion Checklist
