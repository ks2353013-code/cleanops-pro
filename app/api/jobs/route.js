import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';
import { chooseAvailableWorker } from '../../../src/lib/scheduling';

const OPS = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId && user.role !== 'PLATFORM_ADMIN') return fail('Organization required', 403);
    let where = user.role === 'PLATFORM_ADMIN' ? {} : { facility: { organizationId: user.organizationId } };
    if (user.role === 'PROFESSIONAL') {
      const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
      if (!worker) return Response.json({ data: [] });
      where = { ...where, workerId: worker.id };
    } else if (!OPS.includes(user.role) && !['CLIENT_MANAGER', 'CUSTOMER'].includes(user.role)) {
      return fail('Job access required', 403);
    }
    const data = await prisma.job.findMany({
      where,
      include: { facility: true, contract: true, worker: { include: { user: true } }, inspections: true },
      orderBy: [{ scheduledStart: 'asc' }, { createdAt: 'desc' }]
    });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load jobs',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!OPS.includes(user.role)) return fail('Operations access required', 403);
    let body;
    try { body = await req.json(); } catch { return fail('Request body must be valid JSON', 400); }
    const facilityId = typeof body.facilityId === 'string' ? body.facilityId.trim() : '';
    const startRaw = body.scheduledStart || body.scheduledFor;
    if (!facilityId || !startRaw) return fail('facilityId and scheduledStart are required', 400);
    const scheduledStart = new Date(startRaw);
    const scheduledEnd = body.scheduledEnd ? new Date(body.scheduledEnd) : new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);
    if (Number.isNaN(scheduledStart.getTime()) || Number.isNaN(scheduledEnd.getTime()) || scheduledEnd <= scheduledStart) {
      return fail('A valid schedule end after the start is required', 400);
    }
    if (scheduledStart <= new Date()) return fail('Jobs must be scheduled in the future', 400);
    const facility = await prisma.facility.findFirst({
      where: { id: facilityId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) }
    });
    if (!facility) return fail('Facility not found', 404);
    const contractId = typeof body.contractId === 'string' && body.contractId ? body.contractId : null;
    if (contractId) {
      const contract = await prisma.contract.findFirst({
        where: { id: contractId, facilityId, status: 'ACTIVE', ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) }
      });
      if (!contract) return fail('Active contract for this facility not found', 404);
    }

    let workerId = typeof body.workerId === 'string' && body.workerId ? body.workerId : null;
    const organizationFilter = user.role === 'PLATFORM_ADMIN' ? {} : { user: { organizationId: user.organizationId } };
    const windowFilter = { scheduledStart: { lt: scheduledEnd }, scheduledEnd: { gt: scheduledStart }, status: { notIn: ['CANCELLED', 'COMPLETED', 'MISSED'] } };
    if (workerId) {
      const worker = await prisma.worker.findFirst({
        where: { id: workerId, status: { in: ['VERIFIED', 'ACTIVE'] }, user: { ...organizationFilter.user, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }), active: true } }
      });
      if (!worker) return fail('Eligible professional not found', 404);
      const conflict = await prisma.job.findFirst({ where: { workerId, ...windowFilter }, select: { id: true } });
      if (conflict) return fail('This professional already has a job during the requested time', 409);
    } else if (body.autoAssign === true) {
      const workers = await prisma.worker.findMany({
        where: { status: { in: ['VERIFIED', 'ACTIVE'] }, user: { ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }), active: true } },
        include: { user: { select: { id: true, name: true, active: true, organizationId: true } } }
      });
      const conflictingJobs = await prisma.job.findMany({
        where: { ...windowFilter, workerId: { not: null }, ...(user.role === 'PLATFORM_ADMIN' ? {} : { facility: { organizationId: user.organizationId } }) },
        select: { workerId: true }
      });
      const conflictIds = conflictingJobs.map(j => j.workerId).filter(Boolean);
      const selected = chooseAvailableWorker(workers, facility.type, conflictIds);
      if (!selected) return fail('No eligible professional is available for this time. Choose another time or assign a worker manually.', 409);
      workerId = selected.id;
    }

    const data = await prisma.$transaction(async tx => {
      const job = await tx.job.create({
        data: { facilityId, contractId, workerId, scheduledStart, scheduledEnd, status: 'SCHEDULED' },
        include: { facility: true, contract: true, worker: { include: { user: true } } }
      });
      await tx.auditEvent.create({ data: {
        organizationId: facility.organizationId, actorUserId: user.id, action: 'JOB_SCHEDULED',
        entityType: 'Job', entityId: job.id, metadata: { scheduledStart: scheduledStart.toISOString(), scheduledEnd: scheduledEnd.toISOString(), workerId, assignmentMode: body.autoAssign === true ? 'AUTO' : 'MANUAL' }
      }});
      if (workerId) {
        const worker = await tx.worker.findUnique({ where: { id: workerId }, select: { userId: true } });
        if (worker) await tx.notification.create({ data: {
          userId: worker.userId, organizationId: facility.organizationId, title: 'New cleaning job assigned',
          message: `A job at ${facility.name} has been scheduled for ${scheduledStart.toLocaleString('en-IN')}.`
        }});
      }
      return job;
    });
    return Response.json({ data, assignment: workerId ? (body.autoAssign === true ? 'AUTO_ASSIGNED' : 'ASSIGNED') : 'UNASSIGNED' }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to schedule job',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
