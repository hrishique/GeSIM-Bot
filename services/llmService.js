// services/llmService.js
const OpenAI = require('openai');
require('dotenv').config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// persona + helper prompts
const BOT_PERSONA = `You are GeSIM_AI — a concise, friendly, slightly-geeky on-chain travel co-pilot.
Public replies must be <= 240 chars. Threads numbered steps max 6. Never invent facts beyond provided events.`;

async function generateShortReply(confName, events) {
  const list = events.map(e => `${e.title} @ ${e.venue} — ${new Date(e.startTs).toLocaleTimeString()}`).join(' · ');
  const prompt = `${BOT_PERSONA}\nUser: Produce a single-line tweet (<=240 chars) that lists the top ${events.length} events for ${confName}: ${list}. End with "DM for more" or "Thread ⤵️ for details".\nOutput only the tweet text.`;
  const resp = await client.responses.create({ model: 'gpt-4o-mini', input: prompt, max_output_tokens: 200 });
  const text = resp.output_text || (resp.output && resp.output[0] && resp.output[0].content?.map(c => c.text).join('')) || '';
  return text.trim();
}

async function generateThread(objective, confName, events) {
  const ev = events.map((e, i) => `${i + 1}. ${e.title} @ ${e.venue} (${new Date(e.startTs).toLocaleString()}) — ${e.tags?.join(', ') ?? ''}`).join('\n');
  const prompt = `${BOT_PERSONA}\nCreate a compact threaded itinerary for objective: "${objective}" at ${confName}.\nEvents:\n${ev}\nOutput a JSON array of strings. First element = header, rest = numbered steps (max 6). Include one networking script. Last element = CTA (download GeSIM app or DM for invite with $GSM). Use only provided event info.`;
  const resp = await client.responses.create({ model: 'gpt-4o-mini', input: prompt, max_output_tokens: 600 });
  const text = resp.output_text || '';
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // fallback: split into lines
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.slice(0, 8);
  }
}

module.exports = {
  generateShortReply,
  generateThread
};
