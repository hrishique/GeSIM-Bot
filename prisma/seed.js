// Run: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const conf = await prisma.conference.upsert({
    where: { slug: 'devconnect' },
    update: {},
    create: {
      slug: 'devconnect',
      name: 'Devconnect',
      city: 'Bucharest',
      country: 'Romania',
      startDate: new Date('2025-05-01T00:00:00Z'),
      endDate: new Date('2025-05-07T00:00:00Z'),
      timezone: 'Europe/Bucharest'
    }
  });

  await prisma.event.createMany({
    data: [
      {
        confId: conf.id,
        source: 'manual',
        title: 'DeFi Afterparty at OldTown',
        description: 'Bring energy, DJ starts at 22:00',
        venue: 'OldTown Club',
        startTs: new Date('2025-05-02T20:00:00Z'),
        url: 'https://example.com/defi-afterparty',
        tags: ['De-Fi', 'Afterparty']
      },
      {
        confId: conf.id,
        source: 'manual',
        title: 'Gaming Night — Token Games',
        description: 'Retro arcade and token giveaways',
        venue: 'Arcade House',
        startTs: new Date('2025-05-03T19:30:00Z'),
        url: 'https://example.com/gaming-night',
        tags: ['Gaming']
      },
      {
        confId: conf.id,
        source: 'manual',
        title: 'DePIN meetup — Infra builders',
        description: 'Discuss decentralised infra & roaming',
        venue: 'MNO Lounge',
        startTs: new Date('2025-05-03T18:00:00Z'),
        url: 'https://example.com/depin-meetup',
        tags: ['De-Pin', 'Infra']
      },
      {
        confId: conf.id,
        source: 'manual',
        title: 'Crypto Social Brunch',
        description: 'Networking brunch for founders',
        venue: 'Cafe Central',
        startTs: new Date('2025-05-03T11:00:00Z'),
        url: 'https://example.com/brunch',
        tags: ['Networking']
      }
    ]
  });

  console.log('Seed completed.');
}
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
