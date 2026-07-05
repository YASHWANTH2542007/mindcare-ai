const express = require('express');
const { requireAuth } = require('../middleware/auth');
const CheckIn = require('../models/CheckIn');
const { callGemini } = require('../services/geminiClient');

const router = express.Router();
router.use(requireAuth);

// POST /api/ask — free-form question, answered with the student's latest check-in as context
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
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

    const { text, model } = await callGemini(prompt, { maxTokens: 300 });

    res.json({ answer: text, source: 'llm', model });
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
