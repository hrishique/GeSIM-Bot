// test.js - simulate a webhook payload locally
const mentionHandler = require('./services/mentionHandler');

async function run() {
  const payload = {
    data: { id: '12345', text: 'Hey @GeSIM_AI DEVCONNECT what are the top events tonight?' },
    includes: { users: [{ username: 'tester' }] }
  };
  await mentionHandler.process(payload);
  console.log('done');
}

run().catch(console.error);
