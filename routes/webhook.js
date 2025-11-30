// routes/webhook.js
const express = require('express');
const router = express.Router();
const mentionController = require('../controllers/mentionController');
const verifyCrc = require('../middlewares/verifyTwitterCrc');

// For CRC verification (GET)
router.get('/twitter', verifyCrc);

// POST endpoint that receives twitter webhook events
router.post('/twitter', async (req, res) => {
  // basic shape normalization - adapt per your webhook mode
  try {
    const payload = req.body;
    // ignore non-tweet events
    if (!payload) return res.status(200).send('ignored');

    // if v1.1 tweet_create_events
    if (payload.tweet_create_events) {
      for (const ev of payload.tweet_create_events) {
        // ignore bot's own tweets
        const botHandle = (process.env.BOT_TWITTER_HANDLE || '').toLowerCase();
        if (ev.user && ev.user.screen_name && ev.user.screen_name.toLowerCase() === botHandle) continue;
        // shape for controller
        const normalized = { data: { id: ev.id_str, text: ev.text }, includes: { users: [{ username: ev.user.screen_name }] } };
        await mentionController.handle(normalized);
      }
    } else {
      // v2 style or other
      await mentionController.handle(payload);
    }
    res.status(200).send('ok');
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).send('error');
  }
});

module.exports = router;
