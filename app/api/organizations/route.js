import { db } from '../../../src/lib/db';

export async function GET() {
  const data = await db.organization.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return Response.json({ data });
}

export async function POST(req) {
  const body = await req.json();
  if (!body.name) return Response.json({ error: 'name is required' }, { status: 400 });
  const data = await db.organization.create({ data: { name: String(body.name).trim() } });
  return Response.json({ data }, { status: 201 });
}
