import { prisma } from '../../../../../lib/prisma';

export async function GET(req) {
  const expected = process.env.CLEANOPS_CRON_SECRET;
  const supplied = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!expected || !supplied || supplied !== expected) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const jobs = await prisma.automationJob.findMany({
    where: { status: { in: ['PENDING', 'RETRY'] }, runAt: { lte: now }, attempts: { lt: 5 } },
    orderBy: { createdAt: 'asc' },
    take: 20
  });
  const results = [];
  for (const job of jobs) {
    const claimed = await prisma.automationJob.updateMany({
      where: { id: job.id, status: job.status, attempts: job.attempts },
      data: { status: 'PROCESSING', lockedAt: now, attempts: { increment: 1 } }
    });
    if (!claimed.count) continue;
    try {
      // Safe initial adapter: audit the event only. Real external delivery stays disabled until configured.
      await prisma.$transaction([
        prisma.auditEvent.create({
          data: {
            organizationId: job.organizationId,
            action: 'AUTOMATION_DRY_RUN_COMPLETED',
            entityType: 'AutomationJob',
            entityId: job.id,
            metadata: { eventType: job.eventType, payload: job.payload, mode: 'dry-run' }
          }
        }),
        prisma.automationJob.update({
          where: { id: job.id },
          data: { status: 'COMPLETED', completedAt: new Date(), lockedAt: null, lastError: null }
        })
      ]);
      results.push({ id: job.id, status: 'COMPLETED' });
    } catch (e) {
      const attempts = job.attempts + 1;
      const dead = attempts >= job.maxAttempts;
      await prisma.automationJob.update({
        where: { id: job.id },
        data: {
          status: dead ? 'DEAD_LETTER' : 'RETRY',
          runAt: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000),
          lockedAt: null,
          lastError: String(e?.message || 'Automation failed').slice(0, 1000)
        }
      });
      results.push({ id: job.id, status: dead ? 'DEAD_LETTER' : 'RETRY' });
    }
  }
  return Response.json({ data: { inspected: jobs.length, results } });
}
