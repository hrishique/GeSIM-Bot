// controllers/mentionController.js
const mentionHandler = require('../services/mentionHandler');

module.exports = {
  handle: async (payload) => {
    try {
      await mentionHandler.process(payload);
    } catch (err) {
      console.error('mentionController error', err);
    }
  }
};
