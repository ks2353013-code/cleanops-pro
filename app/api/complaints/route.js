import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const OPS = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];
const CLIENT = ['CUSTOMER', 'CLIENT_MANAGER'];
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const user = await requireUser();
    if (!OPS.includes(user.role) && !CLIENT.includes(user.role)) return fail('Complaint access required', 403);
    if (!user.organizationId && user.role !== 'PLATFORM_ADMIN') return fail('Organization required', 403);
    const data = await prisma.complaint.findMany({
      where: user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId },
      include: { facility: true }, orderBy: { createdAt: 'desc' }, take: 200
    });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load complaints',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!CLIENT.includes(user.role)) return fail('Customer access required', 403);
    if (!user.organizationId) return fail('Organization required', 409);
    const body = await req.json();
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 4000) : '';
    const severity = String(body.severity || 'MEDIUM').toUpperCase();
    const facilityId = typeof body.facilityId === 'string' && body.facilityId ? body.facilityId : null;
    if (!description) return fail('description is required', 400);
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) return fail('Invalid severity', 400);
    if (facilityId && !await prisma.facility.findFirst({ where: { id: facilityId, organizationId: user.organizationId }, select: { id: true } })) return fail('Facility not found', 404);
    const result = await prisma.$transaction(async tx => {
      const complaint = await tx.complaint.create({ data: {
        organizationId: user.organizationId, facilityId, createdByUserId: user.id, description, severity
      }, include: { facility: true } });
      await tx.auditEvent.create({ data: {
        organizationId: user.organizationId, actorUserId: user.id, action: 'COMPLAINT_CREATED',
        entityType: 'Complaint', entityId: complaint.id, metadata: { severity, facilityId }
      }});
      return complaint;
    });
    return Response.json({ data: result }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create complaint',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function PATCH(req) {
  try {
    const user = await requireUser();
    if (!OPS.includes(user.role)) return fail('Operations access required', 403);
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const status = String(body.status || '').toUpperCase();
    const resolution = typeof body.resolution === 'string' ? body.resolution.trim().slice(0, 3000) : '';
    if (!id || !['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) return fail('id and valid status are required', 400);
    if (status === 'RESOLVED' && !resolution) return fail('A resolution note is required to resolve a complaint', 400);
    const current = await prisma.complaint.findFirst({ where: { id, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) } });
    if (!current) return fail('Complaint not found', 404);
    const data = await prisma.$transaction(async tx => {
      const updated = await tx.complaint.update({ where: { id }, data: {
        status, ...(resolution ? { resolution } : {}),
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null
      }, include: { facility: true } });
      await tx.auditEvent.create({ data: {
        organizationId: current.organizationId, actorUserId: user.id, action: 'COMPLAINT_STATUS_CHANGED',
        entityType: 'Complaint', entityId: id, metadata: { from: current.status, to: status }
      }});
      return updated;
    });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to update complaint',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
