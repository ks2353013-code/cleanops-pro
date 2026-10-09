import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const QUOTE_READ_ROLES = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'CLIENT_MANAGER', 'CUSTOMER'];
const QUOTE_CREATE_ROLES = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];
const FREQUENCIES = ['ONE_TIME', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];

function jsonError(error, status) {
  return Response.json({ error }, { status });
}

function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!QUOTE_READ_ROLES.includes(user.role)) return jsonError('Quote access required', 403);

    const where = user.role === 'PLATFORM_ADMIN'
      ? {}
      : user.role === 'CUSTOMER'
        ? { request: { organizationId: user.organizationId, customerId: user.id } }
        : { request: { organizationId: user.organizationId } };

    const data = await prisma.quote.findMany({
      where,
      include: { request: { include: { facility: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return Response.json({ data });
  } catch (error) {
    return jsonError(error?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load quotes',
      error?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!QUOTE_CREATE_ROLES.includes(user.role)) return jsonError('Operations access required to create quotes', 403);

    let body;
    try { body = await req.json(); } catch { return jsonError('Request body must be valid JSON', 400); }

    const requestId = typeof body.requestId === 'string' ? body.requestId.trim() : '';
    const monthlyValue = Number(body.monthlyValue);
    const setupFee = body.setupFee === undefined ? 0 : Number(body.setupFee);
    const staffingCount = Number(body.staffingCount);
    const frequency = String(body.frequency || 'MONTHLY').toUpperCase();
    const slaSummary = typeof body.slaSummary === 'string' ? body.slaSummary.trim().slice(0, 4000) : null;

    if (!requestId) return jsonError('requestId is required', 400);
    if (!Number.isFinite(monthlyValue) || monthlyValue <= 0 || monthlyValue > 100000000) {
      return jsonError('monthlyValue must be a positive amount within the allowed range', 400);
    }
    if (!Number.isFinite(setupFee) || setupFee < 0 || setupFee > 100000000) {
      return jsonError('setupFee must be zero or a positive amount within the allowed range', 400);
    }
    if (!Number.isInteger(staffingCount) || staffingCount < 1 || staffingCount > 10000) {
      return jsonError('staffingCount must be a positive whole number', 400);
    }
    if (!FREQUENCIES.includes(frequency)) return jsonError('Unsupported quote frequency', 400);

    const validUntil = body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(validUntil.getTime()) || validUntil.getTime() <= Date.now()) {
      return jsonError('validUntil must be a future date', 400);
    }

    const requestRecord = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { id: true, organizationId: true, customerId: true, status: true }
    });
    if (!requestRecord) return jsonError('Service request not found', 404);
    if (user.role !== 'PLATFORM_ADMIN' && requestRecord.organizationId !== user.organizationId) {
      return jsonError('Service request not found', 404);
    }
    if (!['NEW', 'ASSESSMENT'].includes(requestRecord.status)) {
      return jsonError('A quote can only be created for a new or assessed request', 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          requestId,
          monthlyValue,
          setupFee,
          staffingCount,
          frequency,
          slaSummary,
          validUntil
        },
        include: { request: { include: { facility: true } } }
      });
      await tx.serviceRequest.update({ where: { id: requestId }, data: { status: 'QUOTED' } });
      await tx.auditEvent.create({
        data: {
          organizationId: requestRecord.organizationId,
          actorUserId: user.id,
          action: 'QUOTE_CREATED',
          entityType: 'Quote',
          entityId: quote.id,
          metadata: { requestId, frequency, staffingCount, validUntil: validUntil.toISOString() }
        }
      });
      return quote;
    });

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return jsonError(error?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create quote',
      error?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
