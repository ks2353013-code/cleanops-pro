import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const fail = (message, status = 400) => Response.json({ error: message }, { status });
const OPS = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role === 'PROFESSIONAL') {
      const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
      if (!worker) return Response.json({ data: [] });
      const data = await prisma.attendance.findMany({ where: { workerId: worker.id }, include: { job: { include: { facility: true } } }, orderBy: { recordedAt: 'desc' }, take: 100 });
      return Response.json({ data });
    }
    if (!OPS.includes(user.role)) return fail('Attendance access required', 403);
    const data = await prisma.attendance.findMany({
      where: user.role === 'PLATFORM_ADMIN' ? {} : { job: { facility: { organizationId: user.organizationId } } },
      include: { worker: { include: { user: true } }, job: { include: { facility: true } } },
      orderBy: { recordedAt: 'desc' }, take: 500
    });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load attendance',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    let body;
    try { body = await req.json(); } catch { return fail('Request body must be valid JSON', 400); }
    const jobId = typeof body.jobId === 'string' ? body.jobId : '';
    const action = body.action;
    if (!jobId || !['check_in', 'check_out'].includes(action)) return fail('jobId and valid action are required', 400);
    const worker = user.role === 'PROFESSIONAL'
      ? await prisma.worker.findUnique({ where: { userId: user.id } })
      : (OPS.includes(user.role) && typeof body.workerId === 'string'
        ? await prisma.worker.findFirst({ where: { id: body.workerId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { user: { organizationId: user.organizationId } }) } })
        : null);
    if (!worker) return fail('Eligible professional required', 403);
    const job = await prisma.job.findFirst({
      where: { id: jobId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { facility: { organizationId: user.organizationId } }) }
    });
    if (!job) return fail('Job not found', 404);
    if (user.role === 'PROFESSIONAL' && job.workerId !== worker.id) return fail('You are not assigned to this job', 403);
    if (action === 'check_in' && !['SCHEDULED', 'CHECKED_IN'].includes(job.status)) return fail('Job cannot be checked in from its current state', 409);
    if (action === 'check_out' && !['IN_PROGRESS', 'CHECKED_IN'].includes(job.status)) return fail('Job cannot be checked out from its current state', 409);
    const latitude = body.latitude == null ? null : Number(body.latitude);
    const longitude = body.longitude == null ? null : Number(body.longitude);
    if ((latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
        (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) return fail('Invalid GPS coordinates', 400);
    const result = await prisma.$transaction(async tx => {
      const attendance = await tx.attendance.create({ data: { jobId, workerId: worker.id, action, latitude, longitude } });
      await tx.job.update({ where: { id: jobId }, data: action === 'check_in'
        ? { status: 'IN_PROGRESS', checkInAt: job.checkInAt || new Date() }
        : { status: 'INSPECTION', checkOutAt: new Date() } });
      await tx.auditEvent.create({ data: {
        organizationId: user.organizationId, actorUserId: user.id, action: action === 'check_in' ? 'ATTENDANCE_CHECK_IN' : 'ATTENDANCE_CHECK_OUT',
        entityType: 'Job', entityId: jobId, metadata: { attendanceId: attendance.id, latitude, longitude }
      }});
      return attendance;
    });
    return Response.json({ data: result }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to record attendance',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
