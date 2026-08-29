import { db } from '../../../src/lib/db';

export async function GET(req) {
  const organizationId = new URL(req.url).searchParams.get('organizationId');
  if (!organizationId) return Response.json({ error: 'organizationId is required' }, { status: 400 });
  const data = await db.facility.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  return Response.json({ data });
}

export async function POST(req) {
  const body = await req.json();
  for (const key of ['organizationId','name','type','address']) if (!body[key]) return Response.json({ error: `${key} is required` }, { status: 400 });
  const data = await db.facility.create({ data: {
    organizationId: body.organizationId,
    name: String(body.name).trim(),
    type: body.type,
    address: String(body.address).trim(),
    areaSqFt: body.areaSqFt ? Number(body.areaSqFt) : undefined,
    operatingHours: body.operatingHours,
    riskProfile: body.riskProfile
  }});
  return Response.json({ data }, { status: 201 });
}
