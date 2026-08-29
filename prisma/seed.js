import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const org = await db.organization.upsert({ where: { id: 'demo-org' }, update: {}, create: { id: 'demo-org', name: 'CleanOps Demo Operations' } });
  await db.facility.upsert({ where: { id: 'demo-facility' }, update: {}, create: {
    id: 'demo-facility', organizationId: org.id, name: 'Greenfield International School', type: 'SCHOOL', address: 'Demo Campus', areaSqFt: 45000, operatingHours: '07:00-19:00', riskProfile: 'MEDIUM'
  }});
  console.log(`Seeded ${org.name}`);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
