import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== 'PROFESSIONAL') return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!user.organizationId) return Response.json({ error: 'Organization context required' }, { status: 403 });

    const worker = await prisma.worker.findFirst({
      where: { userId: user.id, user: { organizationId: user.organizationId } },
      select: {
        id: true,
        classification: true,
        specialization: true,
        status: true,
        rating: true,
        jobsCompleted: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    if (!worker) return Response.json({ error: 'Professional profile not found' }, { status: 404 });
    if (!['ACTIVE', 'VERIFIED'].includes(worker.status)) {
      return Response.json({ error: 'Professional profile is not active' }, { status: 403 });
    }

    const jobs = await prisma.job.findMany({
      where: { workerId: worker.id, facility: { organizationId: user.organizationId } },
      include: { facility: true, contract: true },
      orderBy: { scheduledStart: 'asc' },
      take: 100,
    });
    return Response.json({ data: jobs, worker: { ...worker, name: worker.user.name } });
  } catch (e) {
    const status = e.message === 'UNAUTHENTICATED' ? 401 : 500;
    return Response.json({ error: status === 401 ? 'Authentication required' : 'Unable to load professional jobs' }, { status });
  }
}
