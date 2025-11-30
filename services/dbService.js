// services/dbService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findConferenceBySlug(slug) {
  if (!slug) return null;
  return prisma.conference.findUnique({ where: { slug: slug.toLowerCase() } });
}

async function getFeaturedEventsForConference(confId, limit = 4) {
  const now = new Date();
  return prisma.event.findMany({
    where: {
      confId,
      startTs: { gte: new Date(now.getTime() - 1000 * 60 * 60 * 24) }
    },
    orderBy: [{ curated: 'desc' }, { startTs: 'asc' }],
    take: limit
  });
}

async function logTweet(obj) {
  return prisma.tweetLog.create({ data: obj });
}

module.exports = {
  findConferenceBySlug,
  getFeaturedEventsForConference,
  logTweet,
  prisma
};
