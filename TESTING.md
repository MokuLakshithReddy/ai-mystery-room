# 🧪 AI Mystery Room — Testing & Verification Guide

This document details the automated test suite, verification methodologies, and acceptance checklists for the **AI Mystery Room** detective application.

---

## 🏃 Running the Test Suites

### 1. Backend Automated Tests (Vitest & Supertest)
The backend test suite covers schema validation, difficulty matrix enforcement, scoring math, zero-knowledge secrecy sanitization, and REST API integration endpoints.

```bash
cd server
npm test
```

Expected output:
```
✓ test/unit/mysteryValidator.test.js (8 tests)
✓ test/unit/scoring.test.js (6 tests)
✓ test/unit/secrecy.test.js (4 tests)
✓ test/integration/casesApi.test.js (21 tests)

Test Files  4 passed (4)
Tests       39 passed (39)
```

### 2. Frontend Automated Tests (Vitest & React Testing Library)
The client tests verify core interactive components, score calculation display, and clue discovery state transitions.

```bash
cd client
npm test
```

Expected output:
```
✓ src/test/ScoreBadge.test.jsx (1 test)
✓ src/test/ClueCard.test.jsx (3 tests)

Test Files  2 passed (2)
Tests       4 passed (4)
```

### 3. Production Frontend Build Verification
Verify that the production bundle transforms and minifies cleanly with zero build errors:

```bash
cd client
npm run build
```

---

## 📋 Acceptance Criteria Test Matrix

| Category | Requirement | Test File / Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Difficulty Rules** | Easy: 3 suspects, 5 clues, 2 hints | `test/unit/mysteryValidator.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Difficulty Rules** | Medium: 4 suspects, 7 clues, 3 hints | `test/unit/mysteryValidator.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Difficulty Rules** | Hard: 5 suspects, 9 clues, 3 hints | `test/unit/mysteryValidator.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Input Validation** | Reject premise < 5 chars (HTTP 400) | `test/integration/casesApi.test.js` | ✅ Verified |
| **Input Validation** | Reject premise > 300 chars (HTTP 400) | `test/integration/casesApi.test.js` | ✅ Verified |
| **Input Validation** | Reject invalid difficulty (HTTP 400) | `test/integration/casesApi.test.js` | ✅ Verified |
| **Culprit Integrity** | Culprit must match an existing suspect | `test/unit/mysteryValidator.test.js` | ✅ Verified |
| **Crucial Clues** | Must reference existing clue IDs | `test/unit/mysteryValidator.test.js` | ✅ Verified |
| **Secrecy Boundary** | Active cases mask solution & unrevealed clues | `test/unit/secrecy.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Scoring Formula** | Base Bounties: Easy 100, Med 150, Hard 200 | `test/unit/scoring.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Scoring Formula** | Wrong Accusation: 0 base bounty | `test/unit/scoring.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Scoring Formula** | +5 pts per clue, -10 pts per hint | `test/unit/scoring.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Scoring Formula** | Minimum score floored at 0 | `test/unit/scoring.test.js` & `test/integration/casesApi.test.js` | ✅ Verified |
| **Idempotency** | Re-examining clue adds no duplicate points | `test/integration/casesApi.test.js` | ✅ Verified |
| **State Locks** | Cannot re-accuse on completed case | `test/integration/casesApi.test.js` | ✅ Verified |
| **System Health** | `/api/health` reports status, DB, and AI | `test/integration/casesApi.test.js` | ✅ Verified |
