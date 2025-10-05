
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
require('dotenv').config();

// Simple in-memory rate limiter (per IP). For production use a persistent store (Redis) and better limits.
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 10;
const ipRequests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipRequests.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > rateLimitWindowMs) {
    entry.count = 1;
    entry.windowStart = now;
  } else {
    entry.count += 1;
  }
  ipRequests.set(ip, entry);
  return entry.count <= maxRequestsPerWindow;
}

// POST /api/ai/ask
// Body: { prompt?: string, messages?: [{ role: 'user'|'assistant'|'system', content: string }] }
router.post('/ask', async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { prompt, messages } = req.body || {};
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Build messages array for OpenAI: prefer messages array if provided, otherwise create from prompt
  const systemMsg = { role: 'system', content: 'You are a helpful medical assistant. Keep answers concise, prioritize safety, and do not provide definitive medical diagnoses. When in doubt, recommend seeking medical attention.' };
  let chatMessages = [];
  if (Array.isArray(messages) && messages.length) {
    chatMessages = [systemMsg, ...messages];
  } else if (prompt && typeof prompt === 'string') {
    chatMessages = [systemMsg, { role: 'user', content: prompt }];
  } else {
    return res.status(400).json({ error: 'Missing prompt or messages in request body' });
  }

  if (!OPENAI_API_KEY) {
    // Mock behavior: return a reply that echoes the last user message and includes a generic suggestion
    const lastUser = chatMessages.slice().reverse().find(m => m.role === 'user');
    const userText = lastUser ? String(lastUser.content).slice(0, 200) : '';
    const mock = {
      reply: `Mock reply: I received your message (${userText}). To enable real AI responses, set OPENAI_API_KEY on the server.`,
    };
    console.log(`[AI][MOCK] ip=${ip} prompt=${userText}`);
    return res.json(mock);
  }

  try {
    console.log(`[AI] ip=${ip} messages=${chatMessages.length}`);
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        max_tokens: 500,
      }),
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error('OpenAI API error', apiRes.status, text);
      return res.status(502).json({ error: 'OpenAI API error', details: text });
    }

    const data = await apiRes.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    console.error('AI route error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/ai/simplify-record
// Body: { diagnosis: string, treatment: string }
router.post('/simplify-record', async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { diagnosis, treatment } = req.body || {};
  if (!diagnosis) {
    return res.status(400).json({ error: 'Diagnosis is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const prompt = `Explain the following to a patient in simple, clear, and non-alarming terms, in 2-3 sentences. Diagnosis: "${diagnosis}". Treatment: "${treatment || 'No treatment specified'}".`;

  if (!OPENAI_API_KEY) {
    const mockReply = `This is a mock explanation for "${diagnosis}". The AI is not currently enabled. To get a real explanation, the server administrator must set the OPENAI_API_KEY.`;
    return res.json({ reply: mockReply });
  }

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a medical assistant who explains complex medical terms to patients in a simple, reassuring way.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
      }),
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(502).json({ error: 'OpenAI API error', details: text });
    }

    const data = await apiRes.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    console.error('AI simplification error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
