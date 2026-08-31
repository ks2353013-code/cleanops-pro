import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const ALLOWED = ['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR'];

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!ALLOWED.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (!body.jobId || !['PASS','FAIL'].includes(body.result)) return Response.json({ error: 'jobId and PASS/FAIL result are required' }, { status: 400 });

    const job = await prisma.job.findFirst({
      where: { id: body.jobId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { facility: { organizationId: user.organizationId } }) },
      include: { facility: true, contract: true, worker: true }
    });
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (job.status !== 'INSPECTION') return Response.json({ error: 'Job is not awaiting inspection' }, { status: 409 });

    const organizationId = job.facility.organizationId;
    const result = body.result;
    const inspection = await prisma.$transaction(async (tx) => {
      const record = await tx.inspection.create({ data: {
        organizationId, jobId: job.id, inspectorUserId: user.id,
        result, score: body.score ?? null, checklist: body.checklist ?? undefined,
        notes: body.notes ?? null, failureReasons: body.failureReasons ?? undefined
      }});

      if (result === 'PASS') {
        await tx.job.update({ where: { id: job.id }, data: { status: 'REQUIRED_COMPLETION' } });
      } else {
        await tx.job.update({ where: { id: job.id }, data: { status: 'REWORK' } });
        await tx.rework.create({ data: {
          organizationId, jobId: job.id, inspectionId: record.id,
          assignedWorkerId: job.workerId ?? null,
          reason: body.reworkReason || 'Inspection failed',
          correctiveAction: body.correctiveAction ?? null,
          dueAt: body.dueAt ? new Date(body.dueAt) : null,
          status: 'OPEN'
        }});
      }
      await tx.auditEvent.create({ data: {
        organizationId, actorUserId: user.id, action: result === 'PASS' ? 'QA_PASSED' : 'QA_FAILED_REWORK_CREATED',
        entityType: 'Job', entityId: job.id,
        metadata: { inspectionId: record.id, score: body.score ?? null }
      }});
      return record;
    });
    return Response.json({ data: inspection, nextStatus: result === 'PASS' ? 'REQUIRED_COMPLETION' : 'REWORK' }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to record inspection' }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 500 });
  }
}

export async function GET(req) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const inspections = await prisma.inspection.findMany({
      where: { ...(jobId ? { jobId } : {}), ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) },
      orderBy: { createdAt: 'desc' }
    });
    return Response.json({ data: inspections });
  } catch (e) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }
}
