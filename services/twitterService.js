// services/twitterService.js
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.TW_APP_KEY,
  appSecret: process.env.TW_APP_SECRET,
  accessToken: process.env.TW_ACCESS_TOKEN,
  accessSecret: process.env.TW_ACCESS_SECRET
});
const rw = client.readWrite;

async function postTweet(text) {
  const res = await rw.v2.tweet({ text });
  return res.data;
}

async function replyTweet(text, inReplyToId) {
  const res = await rw.v2.tweet({
    text,
    reply: inReplyToId ? { in_reply_to_tweet_id: inReplyToId } : undefined
  });
  return res.data;
}

module.exports = {
  postTweet,
  replyTweet
};
