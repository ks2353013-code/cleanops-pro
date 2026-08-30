import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const ALLOWED = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'PROFESSIONAL'];

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!ALLOWED.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (!body.reworkId) return Response.json({ error: 'reworkId is required' }, { status: 400 });

    const rework = await prisma.rework.findFirst({
      where: { id: body.reworkId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) },
      include: { job: { include: { facility: true } }, inspection: true }
    });
    if (!rework) return Response.json({ error: 'Rework not found' }, { status: 404 });
    if (['COMPLETED', 'CANCELLED'].includes(rework.status)) return Response.json({ error: 'Rework is already closed' }, { status: 409 });
    if (user.role === 'PROFESSIONAL' && rework.assignedWorkerId !== user.worker?.id) return Response.json({ error: 'Rework is not assigned to you' }, { status: 403 });

    const organizationId = rework.job.facility.organizationId;
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.rework.update({ where: { id: rework.id }, data: { status: 'COMPLETED', completedAt: new Date(), correctiveAction: body.correctiveAction ?? rework.correctiveAction } });
      await tx.job.update({ where: { id: rework.jobId }, data: { status: 'INSPECTION' } });
      await tx.auditEvent.create({ data: { organizationId, actorUserId: user.id, action: 'REWORK_COMPLETED_REINSPECTION_REQUIRED', entityType: 'Rework', entityId: rework.id, metadata: { jobId: rework.jobId, correctiveAction: body.correctiveAction ?? null } } });
      return item;
    });
    return Response.json({ data: updated, nextStatus: 'INSPECTION' }, { status: 200 });
  } catch (e) {
    const status = e.message === 'UNAUTHENTICATED' ? 401 : 500;
    return Response.json({ error: status === 401 ? 'Authentication required' : 'Unable to complete rework' }, { status });
  }
}
