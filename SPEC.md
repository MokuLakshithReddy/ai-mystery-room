# AI Mystery Room — Technical Specification Document (SPEC.md)

**Version:** 1.0.0  
**Status:** Approved for Implementation  
**Project:** AI Mystery Room (Detective Investigation Web App)  
**Authors:** AI Architecture & Engineering Team  

---

## 1. Project Overview & Problem Statement

### 1.1 Overview
**AI Mystery Room** is an interactive, AI-driven detective investigation web application. The platform dynamically generates intricate murder mysteries, theft heists, cyber-espionage cases, and whodunit puzzles powered by the Gemini 2.5/Flash generative AI model. 

Players step into the shoes of a lead investigator: they read the initial crime narrative, interrogate or inspect suspect dossiers, search crime scenes to uncover concealed clues, spend budget points on subtle forensic hints, and formally file an accusation against the prime suspect.

### 1.2 Problem Statement
Traditional mystery and puzzle games rely on static, pre-written script trees with zero replay value once solved. Conversely, unconstrained LLM text generation often suffers from hallucinations, narrative plot holes, unsolvable contradictions, or spoilers leaked in the client payload. 

**AI Mystery Room** solves these challenges by combining:
1. **Strict Schematized AI Generation**: Utilizing Gemini Structured Outputs with Zod validation to ensure deterministic clue-to-suspect logic.
2. **Zero-Knowledge Client Security**: Culprit identity, guilt justification, and confidential case resolution remain strictly encapsulated on the Node.js/MongoDB backend until formal accusation submission.
3. **Engaging Gamified Mechanics**: Real-time clue discovery, escalating hint penalties, difficulty tiers, and interactive crime scene investigation aesthetics.

### 1.3 Target Users & Expected User Experience
- **Target Audience**: Mystery fiction enthusiasts, escape-room fans, casual puzzle gamers, and interactive storytelling audiences.
- **Tone & Atmosphere**: Modern noir / high-tech forensic investigation lab. High-contrast dark mode, crimson/amber accents, neon evidence tags, dossiers, and tension-building sound and visual feedback.
- **Session Duration**: 5 to 15 minutes per case, tailored across Easy, Medium, and Hard difficulty levels.

---

## 2. Technology Stack

### 2.1 Frontend Architecture
- **Framework**: React 18+ via Vite (fast HMR, optimized production build)
- **Styling**: Tailwind CSS (rich dark aesthetic, detective slate/zinc palette, gold/crimson badges, custom glassmorphism)
- **Routing**: `react-router-dom` v6+
- **Icons**: `lucide-react` (Magnifying glass, fingerprint, skull, key, shield, alert icons)
- **HTTP Client**: `axios` with global API interceptors and unified error handler
- **Animation & Transitions**: CSS keyframe animations (scanner lines, clue reveal flip, pulse indicators)

### 2.2 Backend Architecture
- **Runtime**: Node.js (v18+ LTS / v20+ LTS / v24+)
- **Web Framework**: Express.js (REST API, modular router, cors, helmet/security middleware)
- **Database**: MongoDB with Mongoose ODM (persisting active investigations, solved archives, and clues)
- **AI Engine**: `@google/genai` (Google Gen AI SDK targeting `gemini-2.5-flash`)
- **Schema Validation**: `zod` for strict runtime validation of Gemini responses and client payloads
- **Environment Management**: `dotenv` for secrets segregation

### 2.3 Hosting & Deployment Targets
- **Frontend**: Vercel (Edge CDN, automatic HTTPS, SPA rewrites)
- **Backend / API**: Node server (Render / Railway / Cloudflare Pages / Vercel Serverless / Cloud Run)
- **Database**: MongoDB Atlas cloud cluster (with local MongoDB fallback during development)

---

## 3. Detailed User Flow & State Machine

```
   +-------------------------------------------------------------+
   |                        HOME PAGE                            |
   |   - Introduction & Detective Badges                         |
   |   - "Start Investigation" CTA                               |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                    CREATE MYSTERY PAGE                      |
   |   - Select Premise / Custom Scenario Input                  |
   |   - Select Difficulty: Easy | Medium | Hard                 |
   |   - Click "Generate Crime Scene"                            |
   +------------------------------+------------------------------+
                                  | (POST /api/cases -> Gemini AI)
                                  v
   +-------------------------------------------------------------+
   |                 CASE FILE GENERATION STATE                  |
   |   - Animated Forensic Scanner & Dossier Initializer         |
   |   - Validates AI Schema; Persists with Culprit Redacted     |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                  INVESTIGATION ROOM (ACTIVE)                |
   |   - Read Crime Synopsis & Setting Details                   |
   |   - Inspect Suspect Dossiers (Alibis, Motives, Behaviors)   |
   |   - Discover Concealed Clues (Inspection action)            |
   |   - Request Detective Hints (Points deducted)               |
   |   - Track Real-time Investigation Score & Progress          |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                     ACCUSATION STAGE                        |
   |   - Review Evidence Summary & Select Culprit Suspect        |
   |   - Submit Reason / Accusation (POST /api/cases/:id/accuse) |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                        RESULTS PAGE                         |
   |   - Verdict Announcement: GUILTY / SOLVED vs WRONG ACCUSATION|
   |   - Final Score Breakdown (Base + Clues - Hints)            |
   |   - Revealed Culprit Identity, Narrative Confession & Motive|
   |   - "Investigate Another Mystery" Button                    |
   +-------------------------------------------------------------+
```

---

## 4. UI & Page Specifications

### 4.1 Global Design System & Aesthetics
- **Theme**: Detective Noir / Forensic Intelligence Command Center.
- **Colors**:
  - Background: Deep Slate `#0B0F19` and Obsidian `#06080E`
  - Cards & Panels: Semi-transparent Glass `#111827`/80 with borders in `slate-800`
  - Accent / Primary: Amber/Gold `#F59E0B` (Detective badge / active focus)
  - Danger / Crimson: `#EF4444` (Suspect, murder weapon, accusation alerts)
  - Success / Clue: Emerald `#10B981` (Discovered clue, solved badge)
  - Typography: Clean sans-serif (`Inter`, `Plus Jakarta Sans`, monospace for evidence codes)

### 4.2 Page Specifications

#### 1. Home Page (`/`)
- **Header**: Application branding with animated magnifying glass emblem and "AI Mystery Room".
- **Hero Section**:
  - Catchy title: *"Every Clue Tells A Story. Can You Crack The Case?"*
  - Interactive Preview Carousel of case themes (Victorian Manor, Orbital Station, Cyberpunk Penthouse, Art Gallery Heist).
  - Feature highlights: Dynamic AI generation, authentic forensic clue hunting, backend-verified scoring.
- **CTA**: "Open Case Files" button navigating to `/create`.
- **Recent Solved Cases / Hall of Fame** preview teaser.

#### 2. Create Mystery Page (`/create`)
- **Premise Selector**:
  - Custom text prompt input: e.g., *"A billionaire robotics engineer found poisoned in a sealed penthouse elevator."*
  - Quick-start Presets:
    1. *The Midnight Gala Cyanide Toast* (High Society Murder)
    2. *Sabotage on Mars Outpost 7* (Sci-Fi Espionage)
    3. *The Missing Venetian Diamond* (Classic Heist)
    4. *The Tech Mogul's Last Commute* (Cyber Mystery)
- **Difficulty Selector**:
  - **Easy**: 3 Suspects, 5 Clues, 2 Hints (Base: 100 pts)
  - **Medium**: 4 Suspects, 7 Clues, 3 Hints (Base: 150 pts)
  - **Hard**: 5 Suspects, 9 Clues, 3 Hints (Base: 200 pts)
- **Action**: "Initialize Investigation" button.
- **Loading State**: High-tech dossier generation screen with step indicators:
  - *"Interrogating AI Story Engine..."*
  - *"Synthesizing forensic clues & alibis..."*
  - *"Sealing classified solution vault..."*

#### 3. Investigation Room Page (`/case/:id`)
- **Top Navigation Banner**:
  - Case Title, Difficulty Badge, Investigation Status (`IN_PROGRESS`).
  - Score Ticker: Current Points (Base + 5 × Clues Found − 10 × Hints Used).
  - Clue Discovery Progress Bar (e.g., `3 / 7 Clues Found`).
- **Main Layout Grid**:
  - **Left / Tab 1: Crime Synopsis & Setting**: Detailed narrative context, timestamp, location, and initial crime scene report.
  - **Middle / Tab 2: Suspects Lineup**:
    - Grid of Suspect Cards.
    - Each card displays Name, Occupation/Role, Stated Alibi, Motive, Relationship to Victim, and Suspicious Behavioral Notes.
  - **Right / Tab 3: Crime Scene Evidence & Clues**:
    - List of Clue cards.
    - Hidden/Concealed Clues have an "Inspect Location / Analyze Evidence" button.
    - Once discovered, displays detailed forensic observation (e.g., *"A broken pocket watch stopped at 11:42 PM with trace almond scent"*).
  - **Bottom Dock / Drawer: Detective Hints**:
    - Available hints counter.
    - "Request Hint (-10 pts)" button with confirmation modal.
    - Unlocked hints displayed with classified stamp.
- **Accusation Action**: Prominent "File Accusation" CTA banner fixed at the bottom once at least 1 clue is discovered.

#### 4. Accusation Modal / Page (`/case/:id/accuse`)
- **Accusation Form**:
  - Suspect selector with radio tiles showing portrait, name, and role.
  - Optional Investigator's Rationale textarea: *"Explain how the evidence implicates this suspect."*
  - Warning banner: *"Filing an accusation concludes the investigation and unlocks the case file. You cannot change your accusation afterwards."*
  - "Submit Official Verdict" button.

#### 5. Results & Case File Solution Page (`/case/:id/result`)
- **Verdict Banner**:
  - **Case Solved (Victory)**: Green banner, *"CASE CLOSED: You caught the culprit!"*
  - **Wrong Accusation (Defeat)**: Red banner, *"CASE UNSOLVED: The real perpetrator escaped!"*
- **Investigator Scorecard**:
  - Accuracy Points (e.g., +150 for Medium)
  - Clue Discovery Bonus (+5 per clue discovered)
  - Hint Penalty (−10 per hint unlocked)
  - Total Final Score with Star Rating / Detective Rank (Rookie, Detective, Master Inspector, Sherlock).
- **The Sealed Solution Revealed**:
  - Identity of the Real Culprit.
  - True Motive and Breakdown of the Crime.
  - How each clue connected to the culprit (Logical Proof Trail).
- **Actions**:
  - "Start New Mystery" button.
  - "Review Investigation Log" toggle.

---

## 5. Backend & Database Architecture

### 5.1 MongoDB Mongoose Schema (`Case` Model)

```typescript
interface ISuspect {
  id: string; // e.g. "suspect_1"
  name: string;
  role: string; // e.g. "Head Butler"
  alibi: string;
  motive: string;
  relationship: string;
  demeanor: string;
}

interface IClue {
  id: string; // e.g. "clue_1"
  title: string;
  location: string; // e.g. "Library Fireplace"
  description: string;
  isDiscovered: boolean;
  discoveredAt?: Date;
}

interface IHint {
  id: string; // e.g. "hint_1"
  text: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

interface ICase {
  title: string;
  premise: string;
  difficulty: 'easy' | 'medium' | 'hard';
  story: {
    synopsis: string;
    victim: string;
    crimeScene: string;
    crimeType: string;
    timeOfCrime: string;
  };
  suspects: ISuspect[];
  clues: IClue[];
  hints: IHint[];
  
  // Confidential backend-only solution fields (Excluded from client responses before accusation)
  solution: {
    culpritId: string; // Matches suspect id
    culpritName: string;
    motiveExplanation: string;
    solutionBreakdown: string;
    crucialClueIds: string[];
  };

  // Player progress & game state
  status: 'active' | 'completed';
  playerAccusation?: {
    accusedSuspectId: string;
    rationale?: string;
    submittedAt: Date;
    isCorrect: boolean;
  };
  score: {
    basePoints: number;
    clueBonus: number;
    hintPenalty: number;
    totalScore: number;
  };
  createdAt: Date;
  completedAt?: Date;
}
```

### 5.2 Confidentiality & Security Enforcement
1. **Projection Sanitization**:
   The `solution` object must **NEVER** be included in any response from `POST /api/cases`, `GET /api/cases/:id`, `POST /api/cases/:id/clues/:clueId/discover`, or `POST /api/cases/:id/hints`.
2. **Hidden Clue Text Sanitization**:
   Un-discovered clues in `GET /api/cases/:id` only return `id`, `title`, `location`, and `isDiscovered: false`. The full `description` of the clue is only revealed once the player triggers the discover action.
3. **Locked Hints Sanitization**:
   Un-unlocked hints only return `id` and `isUnlocked: false`. The `text` is only transmitted when unlocked.
4. **Final Reveal**:
   The `solution` object is **only** returned by `POST /api/cases/:id/accuse` and `GET /api/cases/:id/result` after `status === 'completed'`.

---

## 6. API Endpoints Specification

### 6.1 `POST /api/cases`
- **Description**: Generate a new mystery with Gemini AI and persist to DB.
- **Request Body**:
  ```json
  {
    "premise": "An antique collector murdered during a thunderstorm in a locked study",
    "difficulty": "medium"
  }
  ```
- **Validation**:
  - `premise`: string, min 5 chars, max 300 chars.
  - `difficulty`: enum `["easy", "medium", "hard"]`.
- **Response (201 Created)**:
  Returns sanitized case object (`solution` stripped, clues marked undiscovered, hints locked).

### 6.2 `GET /api/cases/:id`
- **Description**: Retrieve active case for gameplay.
- **Response (200 OK)**:
  Returns sanitized case object with current discovery status.
- **Error (404 Not Found)**: If case does not exist.

### 6.3 `POST /api/cases/:id/clues/:clueId/discover`
- **Description**: Discovers a specific clue in the investigation room.
- **Response (200 OK)**:
  ```json
  {
    "message": "Clue discovered successfully",
    "clue": {
      "id": "clue_2",
      "title": "Muddy Bootprint",
      "location": "French Doors",
      "description": "Size 10 military tread bootprint with trace lime soil from the greenhouse.",
      "isDiscovered": true
    },
    "currentScore": 155
  }
  ```
- **Idempotency**: If clue was already discovered, returns clue without adding duplicate bonus points.

### 6.4 `POST /api/cases/:id/hints`
- **Description**: Unlocks the next available hint for the case.
- **Response (200 OK)**:
  ```json
  {
    "message": "Hint unlocked",
    "hint": {
      "id": "hint_1",
      "text": "Check who had access to the gardener's shed before midnight.",
      "isUnlocked": true
    },
    "hintsRemaining": 2,
    "currentScore": 140
  }
  ```
- **Error (400 Bad Request)**: If all hints for this case have already been unlocked.

### 6.5 `POST /api/cases/:id/accuse`
- **Description**: Submits player's official suspect accusation, seals case, and computes verdict & score.
- **Request Body**:
  ```json
  {
    "suspectId": "suspect_3",
    "rationale": "His boot size matches the footprint and he lacked an alibi between 11 PM and midnight."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "verdict": {
      "isCorrect": true,
      "accusedSuspectId": "suspect_3",
      "culprit": {
        "id": "suspect_3",
        "name": "Dr. Gregory Vance",
        "role": "Personal Physician"
      },
      "motiveExplanation": "Dr. Vance was facing embezzlement charges and forged the will.",
      "solutionBreakdown": "Dr. Vance slipped aconite into the tea at 11:30 PM, then staged the muddy footprint using the gardener's discarded boots.",
      "score": {
        "basePoints": 150,
        "clueBonus": 35,
        "hintPenalty": 10,
        "totalScore": 175
      }
    }
  }
  ```

### 6.6 `GET /api/cases/:id/result`
- **Description**: Retrieves full results, score breakdown, and unredacted case file for a completed case.
- **Constraint**: Only accessible if `case.status === 'completed'`. Returns `400 Bad Request` if case is still in progress.

---

## 7. AI Prompt Engineering & Zod Structured Output

### 7.1 Difficulty & Configuration Matrix

| Difficulty | Suspects Count | Clues Count | Max Hints | Base Points |
| :--- | :--- | :--- | :--- | :--- |
| **Easy** | 3 | 5 | 2 | 100 |
| **Medium** | 4 | 7 | 3 | 150 |
| **Hard** | 5 | 9 | 3 | 200 |

### 7.2 Scoring Algorithm (Backend Calculation)
$$\text{Total Score} = \max\left(0, (\text{Accusation Correct ? Base Points} : 0) + (5 \times \text{Discovered Clues}) - (10 \times \text{Unlocked Hints})\right)$$

- **Easy Correct**: 100 base points.
- **Medium Correct**: 150 base points.
- **Hard Correct**: 200 base points.
- **Incorrect Accusation**: 0 base points (player retains clue discovery points minus hints, floored at 0).
- **Minimum Score Guarantee**: $\text{Total Score} \ge 0$.

### 7.3 Gemini System Prompt & Schema
The Gemini prompt instructs the model to construct a logically coherent, solvable mystery adhering to classic detective fiction fairness (the "Knox Decalogue" standard: all necessary clues exist, the culprit is among the suspects, no supernatural intervention).

```typescript
import { z } from 'zod';

export const GeminiMysterySchema = z.object({
  title: z.string().min(3),
  story: z.object({
    synopsis: z.string().min(30),
    victim: z.string().min(2),
    crimeScene: z.string().min(3),
    crimeType: z.string().min(3),
    timeOfCrime: z.string().min(2),
  }),
  suspects: z.array(z.object({
    id: z.string(), // "suspect_1", "suspect_2", etc.
    name: z.string(),
    role: z.string(),
    alibi: z.string(),
    motive: z.string(),
    relationship: z.string(),
    demeanor: z.string(),
  })),
  clues: z.array(z.object({
    id: z.string(), // "clue_1", "clue_2", etc.
    title: z.string(),
    location: z.string(),
    description: z.string(),
  })),
  hints: z.array(z.object({
    id: z.string(), // "hint_1", "hint_2", etc.
    text: z.string(),
  })),
  solution: z.object({
    culpritId: z.string(), // Must match one suspect.id exactly
    culpritName: z.string(),
    motiveExplanation: z.string(),
    solutionBreakdown: z.string(),
    crucialClueIds: z.array(z.string()),
  })
});
```

---

## 8. Frontend Component Hierarchy & Design

```
src/
├── assets/
├── components/
│   ├── Navbar.jsx                # Brand, active case indicator, theme toggle
│   ├── SuspectCard.jsx           # Suspect portrait, details, notes, accusable state
│   ├── ClueCard.jsx              # Concealed vs Discovered clue with scan action
│   ├── HintDrawer.jsx            # Floating hint requester with cost warnings
│   ├── ScoreBadge.jsx            # Dynamic score counter with animation
│   ├── AccusationModal.jsx       # Final verdict selection dialog
│   └── Loader.jsx                # Detective forensic scanning spinner
├── pages/
│   ├── Home.jsx                  # Hero landing, features, mystery samples
│   ├── CreateMystery.jsx         # Prompt presets, difficulty cards, generator
│   ├── InvestigationRoom.jsx     # Master 3-column detective desk
│   └── Results.jsx               # Verdict, confession reveal, scorecard
├── services/
│   └── api.js                    # Axios instance with configured base URL
├── App.jsx                       # Routes definition & notification toasts
└── index.css                     # Tailwind utilities, custom glow & scrollbars
```

---

## 9. Stitch AI Screen Mapping & UI Implementation

| Screen Name | Route | UI Components & Requirements | Stitch Layout Mapping |
| :--- | :--- | :--- | :--- |
| **Command Center (Home)** | `/` | Hero title, dynamic preset carousel, live stats | Minimalist dark hero with glowing badge & action cards |
| **Case Dispatcher (Create)** | `/create` | Premise input, 3 difficulty tiers (Gold/Ruby/Amethyst), generator button | Dual-column setup with interactive difficulty selectors |
| **Detective Desk (Investigation)** | `/case/:id` | Tabbed desk: Narrative, Suspect dossiers, Clue inspection grid, Hint panel | Modern 3-column forensic dashboard with progress metrics |
| **Accusation Chamber** | `/case/:id/accuse` | Suspect radio lineup, rationale input, high-stakes confirmation | Centered high-contrast modal with warning banner |
| **Declassification Vault (Results)**| `/case/:id/result` | Victory/Defeat banner, animated score counter, culprit confession, reset button | Post-mortem dossier with full breakdown & replay CTA |

---

## 10. Acceptance Criteria & Verification Plan

| ID | Criteria | Verification Method |
| :--- | :--- | :--- |
| **AC-01** | Mystery generation succeeds across Easy, Medium, and Hard with exact suspect, clue, and hint counts. | Create cases in all 3 tiers; verify DB documents & API responses match matrix. |
| **AC-02** | Culprit and solution details are never exposed to the client prior to accusation. | Inspect network tab and API responses for `/api/cases` and `/api/cases/:id` to confirm `solution` and unrevealed clue/hint texts are omitted. |
| **AC-03** | Clue discovery dynamically updates score (+5 pts) and unlocks clue descriptions. | Click "Inspect" on undiscovered clue; verify server persists discovery and returns updated score. |
| **AC-04** | Hint requests deduct 10 points and reveal actionable guidance. | Request hint; verify score drops by 10 and hint unlocks until maximum reached. |
| **AC-05** | Accurate accusation computation: Correct yields base points; wrong yields 0 base points; minimum score is 0. | Test correct and wrong suspect accusations; verify score math. |
| **AC-06** | Results screen discloses the true culprit, complete narrative breakdown, and replay button. | Submit accusation; verify transition to `/case/:id/result` with full solution. |
| **AC-07** | Application functions smoothly both locally and deployed on Vercel with environment variables. | Build production bundle (`npm run build`), verify zero console errors, test deployed URL. |

---

*End of SPEC.md. Blueprint validated and ready for Phase 2 implementation.*
