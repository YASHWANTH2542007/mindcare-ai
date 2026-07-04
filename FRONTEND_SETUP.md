# Running the new React frontend

The old vanilla HTML/CSS/JS client has been replaced with a React app (Vite + Framer Motion + Recharts) in `client-react/`.

## First-time setup

```bash
# from the project root
npm install
npm run client:install
```

## Development (hot reload)

Run the backend and the React dev server in two terminals (or use the combined script):

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run client:dev
```

Then open **http://localhost:5173** — the Vite dev server proxies `/api/*` to your Express backend on port 5000.

Or, with `concurrently` installed, just run:
```bash
npm run dev:all
```

## Production build

```bash
npm run client:build   # builds client-react/dist
npm start              # Express now serves client-react/dist directly on :5000
```

## What changed
- `client/` (old vanilla frontend) — removed
- `client-react/` — new Vite + React app
  - Light neumorphism design system (soft-shadow cards/buttons), violet accent (`#6C63FF`), Sora + Inter type
  - Animated "brain pulse" signature visual on login/signup
  - Framer Motion page transitions and micro-interactions throughout
  - React Router for real navigation between Login → Dashboard → Check-In → Ask AI (this fixes the "Analyze My Mood with AI" button not navigating — it's now a proper route transition with server-confirmed data before advancing)
  - Recharts line chart for the 7-day stress trend on the dashboard
- `server/index.js` — now serves `client-react/dist` instead of the old `client/` folder
