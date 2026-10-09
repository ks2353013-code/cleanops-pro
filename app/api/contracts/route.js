import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const STAFF = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];
function error(message, status) { return Response.json({ error: message }, { status }); }

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.organizationId && user.role !== 'PLATFORM_ADMIN') return error('Organization required', 403);
    if (!['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR','CLIENT_MANAGER'].includes(user.role)) return error('Forbidden', 403);
    const where = user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId };
    const data = await prisma.contract.findMany({
      where,
      include: { facility: true, jobs: true, invoices: true },
      orderBy: { createdAt: 'desc' }
    });
    return Response.json({ data });
  } catch (e) {
    return error(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load contracts',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!STAFF.includes(user.role)) return error('Operations access required', 403);
    let body;
    try { body = await req.json(); } catch { return error('Request body must be valid JSON', 400); }
    const quoteId = typeof body.quoteId === 'string' ? body.quoteId.trim() : '';
    if (!quoteId) return error('quoteId is required', 400);

    const result = await prisma.$transaction(async tx => {
      const quote = await tx.quote.findUnique({
        where: { id: quoteId },
        include: { request: { include: { facility: true } } }
      });
      if (!quote) throw Object.assign(new Error('Quote not found'), { status: 404 });
      if (user.role !== 'PLATFORM_ADMIN' && quote.request.organizationId !== user.organizationId) {
        throw Object.assign(new Error('Quote not found'), { status: 404 });
      }
      if (quote.validUntil <= new Date()) throw Object.assign(new Error('Quote has expired'), { status: 409 });
      if (!quote.approvedAt) throw Object.assign(new Error('Quote must be accepted before conversion'), { status: 409 });
      const existing = await tx.contract.findFirst({ where: { organizationId: quote.request.organizationId, facilityId: quote.request.facilityId, name: `Quote ${quote.id}` } });
      if (existing) return existing;
      const startDate = body.startDate ? new Date(body.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (Number.isNaN(startDate.getTime())) throw Object.assign(new Error('Invalid startDate'), { status: 400 });
      const contract = await tx.contract.create({
        data: {
          organizationId: quote.request.organizationId,
          facilityId: quote.request.facilityId,
          name: `Quote ${quote.id}`,
          status: 'DRAFT',
          monthlyValue: quote.monthlyValue,
          startDate
        },
        include: { facility: true }
      });
      await tx.serviceRequest.update({ where: { id: quote.requestId }, data: { status: 'CONVERTED' } });
      await tx.auditEvent.create({
        data: {
          organizationId: quote.request.organizationId,
          actorUserId: user.id,
          action: 'CONTRACT_DRAFT_CREATED',
          entityType: 'Contract',
          entityId: contract.id,
          metadata: { quoteId, requestId: quote.requestId }
        }
      });
      return contract;
    });
    return Response.json({ data: result }, { status: 201 });
  } catch (e) {
    return error(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : e?.message || 'Unable to create contract',
      e?.status || (e?.message === 'UNAUTHENTICATED' ? 401 : 500));
  }
}
