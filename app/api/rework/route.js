import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const ALLOWED = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'PROFESSIONAL'];

export async function GET() {
  try {
    const user = await requireUser();
    if (!ALLOWED.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const worker = user.role === 'PROFESSIONAL' ? await prisma.worker.findUnique({ where: { userId: user.id } }) : null;
    if (user.role === 'PROFESSIONAL' && !worker) return Response.json({ data: [] });
    const where = user.role === 'PLATFORM_ADMIN'
      ? {}
      : { organizationId: user.organizationId, ...(user.role === 'PROFESSIONAL' ? { assignedWorkerId: worker.id } : {}) };
    const data = await prisma.rework.findMany({
      where,
      include: { job: { include: { facility: true, worker: { include: { user: true } } } }, inspection: true, assignedWorker: { include: { user: true } } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });
    return Response.json({ data });
  } catch (e) {
    return Response.json({ error: e.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load rework queue' }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 500 });
  }
}
