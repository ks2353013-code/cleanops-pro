import { prisma } from '../../../../../lib/prisma';
import { requireUser } from '../../../../../src/lib/auth';

export async function POST(_req, context) {
  try {
    const user = await requireUser();
    if (!['CUSTOMER', 'CLIENT_MANAGER', 'PLATFORM_ADMIN'].includes(user.role)) {
      return Response.json({ error: 'Customer access required' }, { status: 403 });
    }
    const { id } = await context.params;
    const result = await prisma.$transaction(async tx => {
      const quote = await tx.quote.findUnique({ where: { id }, include: { request: true } });
      if (!quote) throw Object.assign(new Error('Quote not found'), { status: 404 });
      if (user.role !== 'PLATFORM_ADMIN' &&
          (quote.request.organizationId !== user.organizationId ||
           (user.role === 'CUSTOMER' && quote.request.customerId !== user.id))) {
        throw Object.assign(new Error('Quote not found'), { status: 404 });
      }
      if (quote.validUntil <= new Date()) throw Object.assign(new Error('Quote has expired'), { status: 409 });
      if (quote.approvedAt) return quote;
      if (quote.request.status !== 'QUOTED') throw Object.assign(new Error('Quote is not available for acceptance'), { status: 409 });
      const accepted = await tx.quote.update({ where: { id }, data: { approvedAt: new Date() } });
      await tx.serviceRequest.update({ where: { id: quote.requestId }, data: { status: 'APPROVED' } });
      await tx.auditEvent.create({
        data: {
          organizationId: quote.request.organizationId,
          actorUserId: user.id,
          action: 'QUOTE_ACCEPTED',
          entityType: 'Quote',
          entityId: id,
          metadata: { requestId: quote.requestId }
        }
      });
      return accepted;
    });
    return Response.json({ data: result });
  } catch (e) {
    const status = e?.status || (e?.message === 'UNAUTHENTICATED' ? 401 : 500);
    return Response.json({ error: status === 500 ? 'Unable to accept quote' : e.message }, { status });
  }
}
