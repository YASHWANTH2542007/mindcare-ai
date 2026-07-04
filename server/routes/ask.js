const express = require('express');
const { requireAuth } = require('../middleware/auth');
const CheckIn = require('../models/CheckIn');

const router = express.Router();
router.use(requireAuth);

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// POST /api/ask — free-form question, answered with the student's latest check-in as context
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.json({
        answer:
          "I'd love to help, but the AI service isn't configured right now. In the meantime: consistent sleep and short mindfulness breaks help most students most of the time.",
        source: 'fallback',
      });
    }

    const latest = await CheckIn.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    const context = latest
      ? `For context, their most recent check-in showed: mood "${latest.mood}", ${latest.sleepHrs} hours of sleep, stress score ${latest.stressScore}/100 (${latest.stressLevel}).`
      : 'No recent check-in data is available for this student yet.';

    const prompt = `You are MindCare AI, a calm, supportive wellness assistant for college students. ${context}

The student asks: "${question.trim()}"

Reply in 2-4 sentences, warm and concrete. Do not diagnose. If the question suggests they may be in crisis or considering self-harm, gently encourage them to reach out to a counselor or a helpline instead of answering the question directly.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API responded ${response.status}`);
    }

    const data = await response.json();
    const answer = data?.content?.[0]?.text?.trim();

    if (!answer) throw new Error('Empty response from model');

    res.json({ answer, source: 'llm', model: MODEL });
  } catch (err) {
    console.error('Ask-AI error:', err.message);
    res.json({
      answer:
        "Sorry, I'm having trouble thinking that through right now. Try again in a moment — or if it's urgent, please reach out to a counselor directly.",
      source: 'fallback',
    });
  }
});

module.exports = router;
