// services/mentionHandler.js
const db = require('./dbService');
const twitter = require('./twitterService');
const llm = require('./llmService');
const { extractConferenceSlug, extractKeyword } = require('../utils/extract');
const { sanitizeTweet } = require('../utils/sanitize');

const FEATURED_LIMIT = Number(process.env.FEATURED_LIMIT || 4);

async function process(payload) {
  try {
    const text = payload.data?.text || payload.text || '';
    const tweetId = payload.data?.id || payload.data?.id_str || payload.id;
    const userHandle = (payload.includes && payload.includes.users && payload.includes.users[0] && payload.includes.users[0].username) || (payload.user && payload.user.screen_name) || 'user';

    const slug = extractConferenceSlug(text);
    const conference = await db.findConferenceBySlug(slug);

    if (!conference) {
      const reply = `@${userHandle} I couldn't find that conference. Please tag the official conference token (e.g., DEVCONNECT) or DM me the event name.`;
      await twitter.replyTweet(reply, tweetId);
      return;
    }

    const kw = extractKeyword(text);

    const events = await db.getFeaturedEventsForConference(conference.id, FEATURED_LIMIT);
    let filtered = events;
    if (kw) {
      const norm = kw.toLowerCase();
      filtered = events.filter(e => (e.tags || []).some(t => t.toLowerCase().includes(norm)));
    }

    // Build short reply (LLM fallback to template)
    let shortReply;
    try {
      shortReply = await llm.generateShortReply(conference.name, filtered.length ? filtered : events);
    } catch (e) {
      const top = (filtered.length ? filtered : events).slice(0, FEATURED_LIMIT);
      const parts = top.map(ev => `${ev.title} @ ${ev.venue} (${new Date(ev.startTs).toLocaleTimeString()})`);
      shortReply = `Top picks: ${parts.join(' · ')}. DM for full list.`;
    }
    const replyText = `@${userHandle} ${sanitizeTweet(shortReply, 280)}`;
    const posted = await twitter.replyTweet(replyText, tweetId);
    await db.logTweet({ confSlug: conference.slug, queryText: text, tweetId: posted.id, tweetText: replyText, status: 'replied' });

    // If user asked for a plan / thread
    if (/plan|itinerary|thread|how should I|job|get a/i.test(text)) {
      const objectiveMatch = text.match(/plan for (.+?) (if|at|for|to|,|$)/i);
      const objective = objectiveMatch ? objectiveMatch[1] : 'networking & meetups';
      const eventsForThread = events.slice(0, 6);
      const threadArr = await llm.generateThread(objective, conference.name, eventsForThread);

      if (threadArr && threadArr.length > 0) {
        const first = `@${userHandle} ${sanitizeTweet(threadArr[0], 280)}`;
        const t1 = await twitter.replyTweet(first, tweetId);
        let lastId = t1.id;
        for (let i = 1; i < threadArr.length; i++) {
          const t = await twitter.replyTweet(sanitizeTweet(threadArr[i], 280), lastId);
          lastId = t.id;
        }
      }
    } else {
      const followUp = `@${userHandle} Want events around a specific topic? Reply with keywords like "De-Fi", "Gaming", or "De-Pin" and I'll show matching events.`;
      const f = await twitter.replyTweet(followUp, posted.id);
      await db.logTweet({ confSlug: conference.slug, queryText: text, tweetId: f.id, tweetText: followUp, status: 'followup' });
    }
  } catch (err) {
    console.error('mentionHandler error', err);
  }
}

module.exports = { process };
