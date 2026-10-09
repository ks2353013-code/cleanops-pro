import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const user = await requireUser();
    const data = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return Response.json({ data, unreadCount: data.filter(n => !n.readAt).length });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load notifications',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'].includes(user.role)) return fail('Operations access required', 403);
    const body = await req.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 160) : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
    if (!userId || !title || !message) return fail('userId, title and message are required', 400);
    const recipient = await prisma.user.findFirst({
      where: { id: userId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) },
      select: { id: true, organizationId: true }
    });
    if (!recipient) return fail('Recipient not found', 404);
    const data = await prisma.notification.create({
      data: { userId: recipient.id, organizationId: recipient.organizationId, title, message }
    });
    await prisma.auditEvent.create({ data: {
      organizationId: recipient.organizationId, actorUserId: user.id,
      action: 'NOTIFICATION_CREATED', entityType: 'Notification', entityId: data.id
    }});
    return Response.json({ data }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create notification',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function PATCH(req) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return fail('Notification id is required', 400);
    const result = await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { readAt: new Date() }
    });
    if (!result.count) return fail('Notification not found', 404);
    return Response.json({ data: { id, readAt: new Date().toISOString() } });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to update notification',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
