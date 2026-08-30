import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../src/lib/auth';

const FINANCE_ROLES = ['PLATFORM_ADMIN','OPERATIONS_MANAGER'];

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!FINANCE_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (!body.invoiceId || !body.amount || !body.reference) return Response.json({ error: 'invoiceId, amount and reference are required' }, { status: 400 });
    const invoice = await prisma.invoice.findFirst({ where: { id: body.invoiceId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) }, include: { payments: true } });
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: 'Payment amount must be positive' }, { status: 400 });
    const payment = await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { reference: body.reference } });
      if (existing) return existing;
      const paidTotal = invoice.payments.filter(p => p.status === 'SUCCESS').reduce((s,p) => s + Number(p.amount), 0);
      const nextTotal = paidTotal + amount;
      if (nextTotal > Number(invoice.amount)) throw new Error('PAYMENT_EXCEEDS_BALANCE');
      const created = await tx.payment.create({ data: { organizationId: invoice.organizationId, invoiceId: invoice.id, amount, currency: invoice.currency, status: 'SUCCESS', method: body.method || 'MANUAL', reference: body.reference, paidAt: new Date() } });
      const nextStatus = nextTotal >= Number(invoice.amount) ? 'PAID' : 'PARTIALLY_PAID';
      await tx.invoice.update({ where: { id: invoice.id }, data: { status: nextStatus, paidAt: nextStatus === 'PAID' ? new Date() : null } });
      await tx.auditEvent.create({ data: { organizationId: invoice.organizationId, actorUserId: user.id, action: 'PAYMENT_RECORDED', entityType: 'Payment', entityId: created.id, metadata: { invoiceId: invoice.id, amount, status: nextStatus } } });
      return created;
    });
    return Response.json({ data: payment }, { status: 201 });
  } catch (e) {
    const status = e.message === 'UNAUTHENTICATED' ? 401 : e.message === 'PAYMENT_EXCEEDS_BALANCE' ? 409 : 500;
    return Response.json({ error: status === 401 ? 'Authentication required' : status === 409 ? 'Payment exceeds invoice balance' : 'Unable to record payment' }, { status });
  }
}
