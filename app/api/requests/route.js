import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId) return Response.json({ data: [] });
    const requests = await prisma.serviceRequest.findMany({
      where: { organizationId: user.organizationId },
      include: { facility: true, quotes: true },
      orderBy: { createdAt: 'desc' }
    });
    return Response.json({ data: requests });
  } catch {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!user.organizationId) return Response.json({ error: 'Customer organization is required' }, { status: 409 });
    const body = await req.json();
    const facilityName = String(body.facilityName || '').trim();
    const serviceName = String(body.serviceName || '').trim();
    const facilityType = String(body.facilityType || 'OFFICE').toUpperCase();
    if (!facilityName || !serviceName) return Response.json({ error: 'facility and service are required' }, { status: 400 });
    const facility = await prisma.facility.create({ data: {
      organizationId: user.organizationId,
      name: facilityName,
      type: ['SCHOOL','HOSPITAL','OFFICE','HOTEL','FACTORY','WAREHOUSE','RETAIL','RESIDENTIAL','OTHER'].includes(facilityType) ? facilityType : 'OTHER',
      address: String(body.address || 'To be confirmed'),
      areaSqFt: body.areaSqFt ? Number(body.areaSqFt) : undefined,
      operatingHours: body.operatingHours || null
    }});
    const request = await prisma.serviceRequest.create({ data: {
      organizationId: user.organizationId,
      facilityId: facility.id,
      serviceName,
      requirements: body.requirements || null,
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
      status: 'NEW'
    }});
    return Response.json({ data: request }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create service request' }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 500 });
  }
}
