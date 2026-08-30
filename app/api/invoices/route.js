import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const FINANCE_ROLES = ['PLATFORM_ADMIN','OPERATIONS_MANAGER'];

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!FINANCE_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (!body.jobId) return Response.json({ error: 'jobId is required' }, { status: 400 });
    const job = await prisma.job.findFirst({
      where: { id: body.jobId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { facility: { organizationId: user.organizationId } }) },
      include: { facility: true, contract: true }
    });
    if (!job) return Response.json({ error: 'Job not found' }, { status: 404 });
    if (!['REQUIRED_COMPLETION','COMPLETED'].includes(job.status)) return Response.json({ error: 'Job is not approved for billing' }, { status: 409 });
    const organizationId = job.facility.organizationId;
    const amount = Number(body.amount ?? (job.contract ? job.contract.monthlyValue : 0));
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: 'A positive invoice amount is required' }, { status: 400 });
    const invoice = await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({ where: { organizationId, contractId: job.contractId ?? undefined, status: { not: 'CANCELLED' }, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
      if (existing && body.idempotencyKey && body.idempotencyKey === existing.invoiceNumber) return existing;
      const created = await tx.invoice.create({ data: { organizationId, contractId: job.contractId ?? null, amount, currency: body.currency || 'INR', status: 'ISSUED', invoiceNumber: `CO-${Date.now().toString(36).toUpperCase()}`, dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 15 * 86400000) } });
      await tx.job.update({ where: { id: job.id }, data: { status: 'COMPLETED', completedAt: job.completedAt || new Date() } });
      await tx.auditEvent.create({ data: { organizationId, actorUserId: user.id, action: 'INVOICE_ISSUED', entityType: 'Invoice', entityId: created.id, metadata: { jobId: job.id, amount } } });
      return created;
    });
    return Response.json({ data: invoice }, { status: 201 });
  } catch (e) { return Response.json({ error: e.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to create invoice' }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 500 }); }
}

export async function GET() {
  try {
    const user = await requireUser();
    const data = await prisma.invoice.findMany({ where: user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }, include: { payments: true, contract: true }, orderBy: { createdAt: 'desc' } });
    return Response.json({ data });
  } catch { return Response.json({ error: 'Authentication required' }, { status: 401 }); }
}

export async function PATCH(req) {
  try {
    const user = await requireUser();
    if (!FINANCE_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (!body.id || !['SENT','VOID','CANCELLED'].includes(body.status)) return Response.json({ error: 'id and an allowed invoice status are required' }, { status: 400 });
    const invoice = await prisma.invoice.findFirst({ where: { id: body.id, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) } });
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    const updated = await prisma.invoice.update({ where: { id: invoice.id }, data: { status: body.status } });
    await prisma.auditEvent.create({ data: { organizationId: invoice.organizationId, actorUserId: user.id, action: 'INVOICE_STATUS_CHANGED', entityType: 'Invoice', entityId: invoice.id, metadata: { from: invoice.status, to: body.status } } });
    return Response.json({ data: updated });
  } catch (e) { return Response.json({ error: e.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to update invoice' }, { status: e.message === 'UNAUTHENTICATED' ? 401 : 500 }); }
}
