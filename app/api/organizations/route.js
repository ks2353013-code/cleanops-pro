import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role === 'PLATFORM_ADMIN') {
      const data = await prisma.organization.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return Response.json({ data });
    }
    if (!user.organizationId || !['OPERATIONS_MANAGER', 'SUPERVISOR', 'CLIENT_MANAGER', 'CUSTOMER'].includes(user.role)) return fail('Organization access required', 403);
    const data = await prisma.organization.findMany({ where: { id: user.organizationId } });
    return Response.json({ data });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load organizations',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (user.role !== 'PLATFORM_ADMIN') return fail('Platform administrator access required', 403);
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
    if (!name) return fail('name is required', 400);
    const data = await prisma.organization.create({ data: { name } });
    await prisma.auditEvent.create({ data: {
      actorUserId: user.id, action: 'ORGANIZATION_CREATED', entityType: 'Organization', entityId: data.id
    }});
    return Response.json({ data }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create organization',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
