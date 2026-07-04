# MindCare AI — Full-Stack Edition

> AI-powered student mental health & stress support system.
> Real authentication, real database, real LLM-generated recommendations.

Built for the **Thiranex Virtual Internship** (AI for Sustainability track) by **Yashwanth**, TJS College of Arts and Science.

---

## What changed from the prototype

The earlier version of this project was a frontend-only simulation — all "AI" logic ran in the browser and nothing was saved anywhere. This version is a genuine full-stack application:

| | Prototype | This version |
|---|---|---|
| Auth | None (decorative login form) | Real signup/login, bcrypt-hashed passwords, JWT sessions |
| Data | Lost on page refresh | Persisted in PostgreSQL (`users`, `checkins`, `recommendations` tables) |
| AI recommendations | Hardcoded JS rules, instant | Real call to Claude (Anthropic API), with rule-based fallback if the API is unavailable |
| Dashboard | Fake demo numbers | Computed from your actual check-in history in the database |

## Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Sequelize
- **Auth**: bcrypt password hashing + JWT (7-day sessions)
- **AI**: Anthropic API (Claude) for recommendation generation, with a deterministic rule-based fallback
- **Frontend**: Vanilla HTML/CSS/JS (no framework/build step — open and go)

### Why PostgreSQL instead of MongoDB

The original plan used MongoDB Atlas, but Atlas's signup flow prompts for a credit card even for the free M0 tier (you're never actually charged on M0, but if you'd rather not hand over card details at all, this is the cleaner path). **Render's free PostgreSQL requires no card whatsoever** and runs on the same platform as the app itself — one less account to manage. The trade-off: Render's free Postgres database expires 30 days after creation (see Deployment section below).

## Project structure

```
mindcare-fullstack/
├── package.json
├── .env.example          ← copy to .env and fill in your own values
├── server/
│   ├── index.js          ← Express app entry point (syncs tables, starts server)
│   ├── check-setup.js     ← run this first to validate your .env
│   ├── seed.js             ← creates one demo user for quick login
│   ├── config/db.js       ← PostgreSQL connection (Sequelize)
│   ├── middleware/auth.js ← JWT verification + signing
│   ├── models/
│   │   ├── User.js          ← Sequelize model, UUID primary key
│   │   ├── CheckIn.js        ← belongsTo User
│   │   └── Recommendation.js ← belongsTo User + CheckIn
│   ├── routes/
│   │   ├── auth.js        ← POST /signup, /login, GET /me
│   │   ├── checkins.js    ← POST /, GET /recent, GET /latest
│   │   └── ask.js         ← POST / (free-form question to Claude)
│   └── services/
│       ├── stressEngine.js ← deterministic scoring + fallback recommendations
│       └── aiService.js    ← calls Anthropic API, builds the prompt, parses the response
├── client/
│   ├── index.html
│   ├── css/                ← design tokens, layout, components, screens
│   └── js/
│       ├── api.js          ← fetch wrapper, stores JWT in localStorage
│       ├── nav.js           ← screen switching + auth guard
│       ├── toast.js
│       ├── screen-auth.js    ← real signup/login form logic
│       ├── screen-mood.js    ← check-in form → POST /api/checkins
│       ├── screen-dashboard.js  ← fetches real history, renders charts
│       ├── screen-recommendations.js ← renders AI cards + "ask AI" chat
│       └── screen-misc.js     ← resource filters + logout
└── test/
    ├── stressEngine.test.js
    ├── auth.test.js
    ├── middleware.test.js
    ├── aiService.test.js
    └── run-all.js          ← runs all of the above with one command
```

## Setup (local)

### 1. Install dependencies
```bash
npm install
```

### 2. Get a PostgreSQL database — no credit card needed

**Option A — local install** (good if you want to develop offline):
- Install PostgreSQL Community Server for your OS
- Create a database: `createdb mindcare`
- Your connection string: `postgres://postgres:yourpassword@localhost:5432/mindcare`

**Option B — Render's free Postgres** (recommended, since you'll deploy there anyway):
1. Go to [render.com](https://render.com) → sign up with GitHub (no card)
2. **New** → **PostgreSQL** → choose the **Free** instance type
3. Once created, copy the **External Database URL** from the database's page

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
- **`DATABASE_URL`** — required. Your local or Render connection string from step 2.
- **`DATABASE_SSL`** — set to `true` for Render, `false` for a local database.
- **`JWT_SECRET`** — required. Generate one with `openssl rand -hex 32` (or any long random string).
- **`ANTHROPIC_API_KEY`** — optional but recommended. Get one at console.anthropic.com. Without it, recommendations use the rule-based fallback — the app still works fully, just without LLM-generated text.

### 4. Verify your setup
```bash
npm run check-setup
```

### 5. (Optional) Seed a demo user
```bash
npm run seed
```
Creates `demo@mindcare.ai` / `demo12345` and also creates all database tables (via `sequelize.sync()`), so this is a good first command to run against a fresh database.

### 6. Run the server
```bash
npm start
```
Open **http://localhost:5000**. The same Express server serves both the API and the frontend.

For development with auto-restart on file changes:
```bash
npm run dev
```

## Running the test suite

```bash
npm test
```

Runs unit tests for the stress-scoring logic, password hashing, JWT signing/verification, and the AI fallback path — without needing a live database connection. These verify the business logic is correct in isolation.

To verify the full stack end-to-end (real HTTP requests hitting a real Postgres database), run the server (`npm start`) and either use the actual frontend, or hit the API directly:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Deploying to Render

1. Push this project to a GitHub repo (make sure `.env` is not committed — check `.gitignore`).
2. On Render: New → PostgreSQL → Free tier → wait for it to provision → copy the Internal Database URL (internal is faster and free for traffic between your own services on Render).
3. New → Web Service → connect your repo:
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: Free
4. Add environment variables on the web service:
   ```
   DATABASE_URL = (the Internal Database URL from step 2)
   DATABASE_SSL = true
   JWT_SECRET = (a long random string)
   JWT_EXPIRES_IN = 7d
   ANTHROPIC_API_KEY = (your key, or leave blank)
   ANTHROPIC_MODEL = claude-sonnet-4-5
   ```
5. Deploy. Watch the logs for "PostgreSQL connected" and "Database tables synced".

Important — the 30-day free database expiry: Render's free Postgres is deleted 30 days after creation, with a short grace period to upgrade before data loss. For a graded internship submission this is rarely an issue, but if you want this running long-term, either upgrade the database to a paid instance ($7/mo) before it expires, or recreate a fresh free database and re-run `npm run seed` when needed. Set a calendar reminder.

## How the AI recommendation flow works

1. You submit a check-in (mood, sleep, study load, energy, tags, optional note) from the frontend.
2. The server computes a deterministic stress score (0–100) and level (Low / Moderate / Moderate-High) using `stressEngine.js` — this always runs, instantly, and is fully auditable (no API dependency).
3. The server then calls Claude (`aiService.js`) with that data, asking it to generate a warm summary + 3–5 specific recommendation cards as structured JSON.
4. If the API call fails for any reason (no key, rate limit, network issue, malformed response), the server automatically falls back to `fallbackRecommendations()` — rule-based but still genuinely useful — so the user never sees an error.
5. Both the check-in and the recommendation (with a `source` field noting whether it came from `llm` or `fallback-rule-based`) are saved to PostgreSQL.
6. The frontend's "Ask MindCare AI" chat box also calls Claude directly (`/api/ask`) with the student's latest check-in as context, so follow-up questions get personalized answers.

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) — plaintext passwords are never stored or logged.
- JWTs expire after 7 days by default (`JWT_EXPIRES_IN` in `.env`).
- All check-in and recommendation routes require a valid JWT (`requireAuth` middleware) and are scoped to `req.user.id` — there is no way to read another user's data.
- The Anthropic API key lives only in `.env` (never committed — see `.gitignore`) and is never sent to the frontend.

## What would come next

- Rate-limiting on `/api/ask` to prevent abuse of your Anthropic API quota
- Email verification on signup
- Proper Sequelize migrations instead of `sync()` (fine for a student project; a production app would version its schema changes)
- A real RAG layer — embedding a curated wellness knowledge base and retrieving relevant snippets to ground Claude's responses
- Push notifications / reminders for daily check-ins
- An admin/counselor view aggregating anonymized trends across students (with proper consent and privacy safeguards)
