# GeSIM-Bot
<img src="https://raw.githubusercontent.com/github/explore/main/topics/twitter/twitter.png" width="28"/> GeSIM Twitter Bot (Node.js)

Your crypto-native travel & conference co-pilot — powered by LLMs & real-time Twitter mentions.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=flat-square" />
  <img src="https://img.shields.io/badge/Prisma-ORM-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Twitter%20API-v2-lightblue?style=flat-square" />
  <img src="https://img.shields.io/badge/OpenAI-LLM-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" />
</p>

---

## ✨ Overview

The GeSIM Twitter Bot is a crypto-native AI assistant built to help conference attendees discover events, afterparties, meetups, and curated itineraries — purely by mentioning `@GeSIM_AI` on Twitter (X).

### Features:
- **Database-Driven**: Reads event data only from your Postgres DB (via Prisma). No scraping or external feeds.
- **Mention-Based Replies**: Auto-replies to mentions with the top 4 featured events, including time, venue, and a call-to-action (CTA).
- **Keyword Filtering**: Filters events via keywords (e.g., `De-Fi`, `Gaming`, `De-Pin`).
- **LLM-Powered Threads**: Generates structured threads (5–6 tweets) for queries like "plan", "itinerary", or "what should I do?"
- **Safe & Guardrailed**: Sanitized replies (no PII, no unsafe content) and no hallucinated events (DB-only).

---

## 🚀 Features in Detail

### 🗂️ Database-Driven
All events come from the local Postgres DB. No scraping. No external feeds.

### 💬 Mention-Based Replies
Example:
- **User Tweet**: `@GeSIM_AI DEVCONNECT What events tonight?`
- **Bot Reply**: Top 4 curated events with time, venue, and a CTA.

### 🏷️ Keyword Filtering
Example:
- **User Reply**: `Gaming`
- **Bot Reply**: Events tagged `Gaming` from the database.

### 🧵 LLM Thread Generator
For queries like:
- `@GeSIM_AI what's the plan for DEVCONNECT if I want a marketing job?`

The bot builds:
- A structured thread (5–6 tweets)
- Action steps
- Networking scripts
- CTA with `$GSM`

---

## 🔐 Safe & Guardrailed
- **No hallucinated events**: Replies are based only on DB data.
- **Sanitized replies**: No PII or unsafe content.
- **Optional safeguards**: Rate-limiting and signature verification.

---

## 🏗️ Architecture

```plaintext
                     ┌──────────────────────────┐
   Mention @GeSIM_AI │   Twitter Webhook (X)    │◄──────────────┐
          ──────────►│  /webhook/twitter        │               │
                     └───────────────┬──────────┘               │
                                     │                          │
                                     ▼                          │
                         ┌──────────────────────┐               │
                         │   mentionHandler     │               │
                         │  parse + route       │               │
                         └──────────┬───────────┘               │
                                    │                           │
    ┌───────────────────────────────┴────────────────────────────┐
    │                           Services                         │
    │                                                            │
    │    ┌───────────────┐   ┌───────────────┐   ┌────────────┐  │
    │    │  dbService     │  │ llmService    │   │ twitterSvc │  │
    │    │ Prisma/Postgres│  │ OpenAI Threads│   │Reply/Thread│  │
    │    └───────┬────────┘  └────────┬──────┘   └──────┬─────┘  │
    └────────────┼─────-──────────────┼─────────────────┼───────-┘
                 │                    │                 │
                 ▼                    ▼                 ▼
          ┌────────────┐        ┌────────────┐    ┌────────────┐
          │ Events DB  │        │ LLM Reply  │    │ Tweets API │
          └────────────┘        └────────────┘    └────────────┘
```

---

## 📦 Installation & Setup
1. Clone repo
```sh
git clone https://github.com/<your-org>/gesim-twitter-bot.git
cd gesim-twitter-bot
```
2. Copy environment variables
```sh
cp .env.example .env
```
Fill in:
- Twitter API keys
- OpenAI API key
- DATABASE_URL
- WEBHOOK_CONSUMER_SECRET

3. Install dependencies
```sh
npm install
```
4. Generate Prisma client
```sh
npx prisma generate
```
5. Run migrations
```sh
npx prisma migrate dev --name init
```
6. Seed sample data
```sh
npm run seed
```
7. Run dev server
```sh
npm run dev
```
Server runs at:
http://localhost:8080

---

## 🌐 Webhook Setup (Twitter/X)
To receive mentions in real time:
1. Start ngrok
```sh
ngrok http 8080
```
2. Add webhook URL in Twitter Developer Portal
Example:
https://your-ngrok-url.ngrok-free.app/webhook/twitter

3. Validate CRC challenge
Twitter will call:
```plaintext
GET /webhook/twitter?crc_token=xxxx
```
Your bot automatically responds with `sha256= signature`.

4. Subscribe the bot account to the webhook
(using Account Activity API)

---

## 💡 Environment Variables
| Variable                | Description                          |
|-------------------------|--------------------------------------|
| TW_APP_KEY              | Twitter App Key                      |
| TW_APP_SECRET           | Twitter App Secret                   |
| TW_ACCESS_TOKEN         | Twitter Access Token                 |
| TW_ACCESS_SECRET        | Twitter Access Secret                |
| WEBHOOK_CONSUMER_SECRET | CRC secret for webhook validation    |
| OPENAI_API_KEY          | OpenAI key                           |
| DATABASE_URL            | Postgres connection string           |
| BOT_TWITTER_HANDLE      | Bot username (e.g., GeSIM_AI)        |
| FEATURED_LIMIT          | # of events to show (default: 4)     |

---

## 🎯 How Replies Work
### Public Mention → Short Reply
- Extract conference slug (e.g., DEVCONNECT)
- Fetch events from DB
- Generate LLM short response
- Post via reply to original tweet

### Keyword Reply
Example:
- **User Reply**: `De-Pin`
- **Bot Reply**: Filters tags in DB → replies again.

### Thread Request
Detected via words:
- plan
- itinerary
- thread
- job
- how should I

LLM generates multi-tweet thread.

---

## 🤖 Models & LLM Prompts
- **Default model**: gpt-4o-mini
- Fully customizable in `services/llmService.js`
- Includes:
  - Persona
  - Short reply prompt
  - Thread generation prompt
  - Safety constraints

---

## 🛡️ Production Recommendations
- ✔ Add Redis rate-limiting
- ✔ Add Twitter signature verification
- ✔ Add Sentry logging
- ✔ Add BullMQ for posting tweets safely
- ✔ Use Docker for deployment
- ✔ Rotate API keys frequently

---

## 🧪 Testing
Local webhook simulation:
```sh
node test.js
```

---

## 📄 License
MIT © 2025 GeSIM