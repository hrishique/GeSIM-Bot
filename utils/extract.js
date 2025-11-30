// utils/extract.js
function extractConferenceSlug(text) {
    if (!text) return null;
    const match = text.match(/\b(devconnect|token2049|token-?2049|devconnect)\b/i);
    if (match) return match[0].toLowerCase();
    // fallback: pick first all-caps token of length 3+
    const tokens = text.match(/\b[A-Z0-9]{3,}\b/g);
    if (tokens && tokens.length) return tokens[0].toLowerCase();
    return null;
  }
  
  function extractKeyword(text) {
    if (!text) return null;
    const kwMatch = text.match(/\b(De-Fi|De-Pin|DeFi|Gaming|NFTs|Web3|Networking)\b/i);
    return kwMatch ? kwMatch[0] : null;
  }
  
  module.exports = { extractConferenceSlug, extractKeyword };
  