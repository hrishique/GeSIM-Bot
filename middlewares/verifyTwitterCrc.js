// verifyTwitterCrc.js
// Basic CRC response handler for Twitter Account Activity API CRC challenge.
// If Twitter sends crc_token as query param, respond appropriately.
const crypto = require('crypto');
module.exports = (req, res, next) => {
  const crc_token = req.query.crc_token;
  if (!crc_token) return next();
  const consumer_secret = process.env.WEBHOOK_CONSUMER_SECRET || '';
  const hmac = crypto.createHmac('sha256', consumer_secret).update(crc_token).digest('base64');
  res.status(200).send({ response_token: `sha256=${hmac}` });
};
