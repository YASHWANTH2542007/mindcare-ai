require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, connectDB } = require('./config/db');

// Load all models so Sequelize knows about every table before syncing
require('./models/User');
require('./models/CheckIn');
require('./models/Recommendation');

const authRoutes = require('./routes/auth');
const checkinRoutes = require('./routes/checkins');
const askRoutes = require('./routes/ask');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
// In production (split deployment), set FRONTEND_URL to your Vercel domain
// so only your frontend can call this API. Left unset, all origins are
// allowed — fine for local dev, not recommended once this is public.
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json({ limit: '100kb' }));

// Basic request logging (helpful while developing/demoing)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/ask', askRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---------- Serve the frontend ----------
// The React app (client-react/) is built with `npm run build` into
// client-react/dist. In dev, run the Vite dev server separately
// (npm run dev --prefix client-react) instead of relying on this.
const clientDir = path.join(__dirname, '..', 'client-react', 'dist');
app.use(express.static(clientDir));

// SPA fallback — any non-API GET request returns index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// ---------- Error handler (catches anything that slips past route try/catch) ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ---------- Start ----------
async function start() {
  await connectDB();

  // Creates tables if they don't exist yet. For a student project this is
  // simpler than running migrations — fine for this scale, but a real
  // production app would use `sequelize-cli` migrations instead of sync().
  await sequelize.sync();
  console.log('✅ Database tables synced');

  app.listen(PORT, () => {
    console.log(`🧠 MindCare AI server running → http://localhost:${PORT}`);
  });
}

start();
