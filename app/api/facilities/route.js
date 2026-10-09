import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const OPS = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'CLIENT_MANAGER'];
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== 'PLATFORM_ADMIN' && !user.organizationId) return fail('Organization context required', 403);
    if (!OPS.includes(user.role) && user.role !== 'CUSTOMER') return fail('Facility access required', 403);
    const data = await prisma.facility.findMany({
      where: user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' }
    });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load facilities',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!OPS.includes(user.role)) return fail('Operations or client manager access required', 403);
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
    const address = typeof body.address === 'string' ? body.address.trim().slice(0, 1000) : '';
    const type = String(body.type || '').toUpperCase();
    const types = ['SCHOOL', 'HOSPITAL', 'OFFICE', 'HOTEL', 'FACTORY', 'WAREHOUSE', 'RETAIL', 'RESIDENTIAL', 'OTHER'];
    if (!name || !address || !types.includes(type)) return fail('Valid name, facility type and address are required', 400);
    const organizationId = user.role === 'PLATFORM_ADMIN' ? String(body.organizationId || '') : user.organizationId;
    if (!organizationId) return fail('organizationId is required for platform-created facilities', 400);
    const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return fail('Organization not found', 404);
    const areaSqFt = body.areaSqFt === undefined || body.areaSqFt === '' ? undefined : Number(body.areaSqFt);
    if (areaSqFt !== undefined && (!Number.isInteger(areaSqFt) || areaSqFt <= 0)) return fail('areaSqFt must be a positive whole number', 400);
    const data = await prisma.$transaction(async tx => {
      const facility = await tx.facility.create({ data: {
        organizationId, name, type, address, ...(areaSqFt ? { areaSqFt } : {}),
        ...(body.operatingHours ? { operatingHours: String(body.operatingHours).slice(0, 500) } : {}),
        ...(body.riskProfile ? { riskProfile: String(body.riskProfile).slice(0, 1000) } : {})
      }});
      await tx.auditEvent.create({ data: { organizationId, actorUserId: user.id, action: 'FACILITY_CREATED', entityType: 'Facility', entityId: facility.id, metadata: { type } } });
      return facility;
    });
    return Response.json({ data }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create facility',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
