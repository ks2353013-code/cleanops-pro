import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const OPS = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const user = await requireUser();
    if (!OPS.includes(user.role) && !['CLIENT_MANAGER', 'CUSTOMER'].includes(user.role)) return fail('Quality access required', 403);
    const where = user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId };
    const data = await prisma.inspection.findMany({
      where,
      include: { job: { include: { facility: true, worker: { include: { user: true } } } }, inspector: true, reworks: true },
      orderBy: { createdAt: 'desc' }, take: 200
    });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load inspections',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!OPS.includes(user.role)) return fail('Supervisor or operations access required', 403);
    let body;
    try { body = await req.json(); } catch { return fail('Request body must be valid JSON', 400); }
    const jobId = typeof body.jobId === 'string' ? body.jobId.trim() : '';
    const result = body.result;
    if (!jobId || !['PASS', 'FAIL'].includes(result)) return fail('jobId and result PASS or FAIL are required', 400);
    const score = body.score == null ? null : Number(body.score);
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > 100)) return fail('score must be between 0 and 100', 400);
    const job = await prisma.job.findFirst({
      where: { id: jobId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { facility: { organizationId: user.organizationId } }) },
      include: { facility: true }
    });
    if (!job) return fail('Job not found', 404);
    if (!['INSPECTION', 'REWORK', 'IN_PROGRESS', 'REQUIRED_COMPLETION'].includes(job.status)) return fail('Job is not ready for quality inspection', 409);
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 3000) : null;
    const failureReasons = Array.isArray(body.failureReasons) ? body.failureReasons.filter(x => typeof x === 'string').slice(0, 30) : [];
    const data = await prisma.$transaction(async tx => {
      const inspection = await tx.inspection.create({
        data: { organizationId: job.facility.organizationId, jobId, inspectorUserId: user.id, result, score, notes, failureReasons },
        include: { job: { include: { facility: true } }, inspector: true }
      });
      if (result === 'PASS') {
        await tx.job.update({ where: { id: jobId }, data: { status: 'COMPLETED', completedAt: new Date() } });
      } else {
        await tx.job.update({ where: { id: jobId }, data: { status: 'REWORK' } });
        await tx.rework.create({ data: {
          organizationId: job.facility.organizationId, jobId, inspectionId: inspection.id,
          reason: failureReasons.length ? failureReasons.join('; ').slice(0, 2000) : (notes || 'Quality inspection failed')
        }});
      }
      await tx.auditEvent.create({ data: {
        organizationId: job.facility.organizationId, actorUserId: user.id,
        action: result === 'PASS' ? 'QUALITY_INSPECTION_PASSED' : 'QUALITY_INSPECTION_FAILED',
        entityType: 'Inspection', entityId: inspection.id, metadata: { jobId, score, failureReasons }
      }});
      return inspection;
    });
    return Response.json({ data }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to save inspection',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
