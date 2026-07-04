const express = require('express');
const CheckIn = require('../models/CheckIn');
const Recommendation = require('../models/Recommendation');
const { requireAuth } = require('../middleware/auth');
const { computeStressScore, classifyScore } = require('../services/stressEngine');
const { generateRecommendations } = require('../services/aiService');

const router = express.Router();
router.use(requireAuth); // every route below requires a valid session

const VALID_MOODS = ['great', 'good', 'okay', 'low', 'stressed'];
const VALID_TAGS = ['exam', 'sleep', 'social', 'financial', 'burnout', 'family', 'positive'];

// POST /api/checkins — submit a new mood check-in, get back AI recommendations
router.post('/', async (req, res) => {
  try {
    const { mood, sleepHrs, studyLoad, energy, tags = [], note = '' } = req.body;

    if (!VALID_MOODS.includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood value.' });
    }
    if (
      typeof sleepHrs !== 'number' ||
      typeof studyLoad !== 'number' ||
      typeof energy !== 'number'
    ) {
      return res.status(400).json({ error: 'sleepHrs, studyLoad, and energy must be numbers.' });
    }

    const cleanTags = tags.filter((t) => VALID_TAGS.includes(t));

    const stressScore = computeStressScore({ mood, sleepHrs, studyLoad, energy, tags: cleanTags });
    const stressLevel = classifyScore(stressScore);

    const checkIn = await CheckIn.create({
      userId: req.user.id,
      mood,
      sleepHrs,
      studyLoad,
      energy,
      tags: cleanTags,
      note: note.slice(0, 1000),
      stressScore,
      stressLevel,
    });

    // Generate AI recommendations (real LLM call, with rule-based fallback)
    const aiResult = await generateRecommendations({
      mood,
      sleepHrs,
      studyLoad,
      energy,
      tags: cleanTags,
      note,
      stressScore,
      stressLevel,
    });

    const recommendation = await Recommendation.create({
      userId: req.user.id,
      checkInId: checkIn.id,
      summary: aiResult.summary,
      cards: aiResult.cards,
      source: aiResult.source,
      model: aiResult.model,
    });

    res.status(201).json({
      checkIn,
      recommendation,
    });
  } catch (err) {
    console.error('Check-in creation error:', err);
    res.status(500).json({ error: 'Something went wrong saving your check-in.' });
  }
});

// GET /api/checkins/recent — last 7 check-ins for the dashboard chart
router.get('/recent', async (req, res) => {
  try {
    const checkIns = await CheckIn.recentForUser(req.user.id, 7);
    res.json({ checkIns });
  } catch (err) {
    console.error('Fetch recent check-ins error:', err);
    res.status(500).json({ error: 'Could not load recent check-ins.' });
  }
});

// GET /api/checkins/latest — most recent check-in + its recommendation (for dashboard + AI screen)
router.get('/latest', async (req, res) => {
  try {
    const checkIn = await CheckIn.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    if (!checkIn) return res.json({ checkIn: null, recommendation: null });

    const recommendation = await Recommendation.findOne({
      where: { checkInId: checkIn.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({ checkIn, recommendation });
  } catch (err) {
    console.error('Fetch latest check-in error:', err);
    res.status(500).json({ error: 'Could not load your latest check-in.' });
  }
});

module.exports = router;
