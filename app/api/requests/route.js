import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const CUSTOMER_ROLES = ['CUSTOMER', 'CLIENT_MANAGER'];
const FACILITY_TYPES = ['SCHOOL','HOSPITAL','OFFICE','HOTEL','FACTORY','WAREHOUSE','RETAIL','RESIDENTIAL','OTHER'];

function fail(message, status) { return Response.json({ error: message }, { status }); }

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId) return Response.json({ data: [] });
    const where = user.role === 'PLATFORM_ADMIN' ? {} :
      user.role === 'CUSTOMER'
        ? { organizationId: user.organizationId, customerId: user.id }
        : { organizationId: user.organizationId };
    const data = await prisma.serviceRequest.findMany({
      where, include: { facility: true, quotes: true }, orderBy: { createdAt: 'desc' }
    });
    return Response.json({ data });
  } catch (error) {
    return fail(error?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load requests',
      error?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!CUSTOMER_ROLES.includes(user.role)) return fail('Customer access required', 403);
    if (!user.organizationId) return fail('Customer organization is required', 409);
    let body;
    try { body = await req.json(); } catch { return fail('Request body must be valid JSON', 400); }

    const facilityName = typeof body.facilityName === 'string' ? body.facilityName.trim().slice(0, 160) : '';
    const serviceName = typeof body.serviceName === 'string' ? body.serviceName.trim().slice(0, 160) : '';
    const address = typeof body.address === 'string' ? body.address.trim().slice(0, 1000) : '';
    const requirements = typeof body.requirements === 'string' ? body.requirements.trim().slice(0, 4000) : '';
    const facilityType = String(body.facilityType || 'OFFICE').toUpperCase();
    if (!facilityName || !serviceName || !address) return fail('facilityName, serviceName and address are required', 400);

    let preferredDate;
    if (body.preferredDate) {
      preferredDate = new Date(body.preferredDate);
      if (Number.isNaN(preferredDate.getTime()) || preferredDate.getTime() < Date.now() - 60_000) {
        return fail('preferredDate must be a valid current or future date', 400);
      }
    }
    let areaSqFt;
    if (body.areaSqFt !== undefined && body.areaSqFt !== null && body.areaSqFt !== '') {
      areaSqFt = Number(body.areaSqFt);
      if (!Number.isInteger(areaSqFt) || areaSqFt < 1 || areaSqFt > 100000000) return fail('areaSqFt must be a positive whole number', 400);
    }

    const result = await prisma.$transaction(async tx => {
      let facility = await tx.facility.findFirst({
        where: { organizationId: user.organizationId, name: facilityName }
      });
      if (facility) {
        if (address && facility.address !== address) {
          facility = await tx.facility.update({ where: { id: facility.id }, data: { address } });
        }
      } else {
        facility = await tx.facility.create({
          data: {
            organizationId: user.organizationId,
            name: facilityName,
            type: FACILITY_TYPES.includes(facilityType) ? facilityType : 'OTHER',
            address,
            ...(areaSqFt ? { areaSqFt } : {}),
            ...(body.operatingHours ? { operatingHours: String(body.operatingHours).slice(0, 160) } : {})
          }
        });
      }
      const request = await tx.serviceRequest.create({
        data: {
          organizationId: user.organizationId,
          customerId: user.id,
          facilityId: facility.id,
          serviceName,
          ...(requirements ? { requirements } : {}),
          ...(preferredDate ? { preferredDate } : {}),
          status: 'NEW'
        },
        include: { facility: true }
      });
      await tx.auditEvent.create({
        data: {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: 'SERVICE_REQUEST_CREATED',
          entityType: 'ServiceRequest',
          entityId: request.id,
          metadata: { facilityId: facility.id, serviceName }
        }
      });
      await tx.automationJob.create({
        data: {
          organizationId: user.organizationId,
          eventKey: `service-request-created:${request.id}`,
          eventType: 'SERVICE_REQUEST_CREATED',
          payload: { requestId: request.id, customerId: user.id, facilityId: facility.id, serviceName }
        }
      });
      return request;
    });
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return fail(error?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create service request',
      error?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
