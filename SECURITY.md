# 🔒 AI Mystery Room — Security Policy & Secrecy Architecture

This document outlines the security boundaries, data sanitization policies, and vulnerability reporting procedures for the **AI Mystery Room**.

---

## 🛡️ Zero-Knowledge Secrecy Boundary

The primary game mechanic depends on absolute secrecy: the player must not be able to determine the culprit through browser developer tools, DOM inspection, or network monitoring.

### 1. Backend Authority & Solution Masking
- **Database Schema**: The `solution` object in the Mongoose `Case` schema has `{ select: false }`. It is never loaded by default queries.
- **Active Case Serializer (`sanitizeCaseForClient`)**:
  - The `solution` object is stripped before transmitting active cases.
  - Undiscovered clues only expose their general location (e.g. `Library Fireplace - Unexamined Area`). Detailed forensic descriptions remain strictly on the backend.
  - Locked hints mask their guidance text until the player explicitly unlocks them.
- **Declassification**: Only when an official accusation is submitted via `POST /api/cases/:id/accuse` does the backend calculate the verdict and return the declassified solution breakdown.

### 2. Input Sanitization & Payload Validation
- All inputs (`premise`, `difficulty`, `suspectId`, `rationale`) are validated on the backend.
- `premise` is trimmed and validated for lengths between 5 and 300 characters.
- `difficulty` must strictly be one of `easy`, `medium`, or `hard`.
- Express JSON request-body parser is limited to `1mb` to prevent payload flooding.

### 3. Secret Protection & Version Control
- All API keys (`GEMINI_API_KEY`, database credentials, deployment tokens) are loaded from environment variables.
- `.env` files are strictly excluded from version control via `.gitignore`.
- Template files (`.env.example`) provide placeholder values only.

### 4. CORS Policy
- Production CORS is configured to restrict cross-origin requests to the approved frontend origin (`CLIENT_URL` and `*.vercel.app`).
- Only `GET`, `POST`, and `OPTIONS` HTTP methods are accepted.

---

## 📬 Reporting Vulnerabilities

If you discover a security issue or unexpected data leak:
1. Do not open a public issue on GitHub.
2. Email: `mokulakshithreddy@gmail.com` with a description of the issue and reproduction steps.
