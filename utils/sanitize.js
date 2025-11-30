// utils/sanitize.js
function sanitizeTweet(text, maxLen = 280) {
    if (!text) return '';
    let t = text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    // basic remove emails/phones (avoid PII leakage)
    t = t.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted]');
    t = t.replace(/\b(\+?\d{7,15})\b/g, '[redacted]');
    if (t.length > maxLen) t = t.slice(0, maxLen - 1) + '…';
    return t;
  }
  
  module.exports = { sanitizeTweet };
  