import crypto from 'node:crypto';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const fail = (message, status = 400) => Response.json({ error: message }, { status });
const CLIENT = ['CUSTOMER', 'CLIENT_MANAGER', 'PLATFORM_ADMIN', 'OPERATIONS_MANAGER'];

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!CLIENT.includes(user.role)) return fail('Payment access required', 403);
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return fail('Online payments are not configured yet', 503);
    const body = await req.json();
    const invoiceId = typeof body.invoiceId === 'string' ? body.invoiceId : '';
    if (!invoiceId) return fail('invoiceId is required', 400);
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, ...(user.role === 'PLATFORM_ADMIN' ? {} : { organizationId: user.organizationId }) },
      include: { payments: true }
    });
    if (!invoice || ['VOID', 'CANCELLED'].includes(invoice.status)) return fail('Payable invoice not found', 404);
    const paid = invoice.payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount), 0);
    const due = Number((Number(invoice.amount) - paid).toFixed(2));
    if (due <= 0) return fail('Invoice has no outstanding balance', 409);
    const receipt = 'co_' + crypto.randomUUID().replaceAll('-', '').slice(0, 32);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: Math.round(due * 100), currency: invoice.currency || 'INR', receipt, notes: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber } })
    });
    const order = await response.json().catch(() => ({}));
    if (!response.ok || !order.id) return fail('Payment provider could not create an order', 502);
    await prisma.payment.create({
      data: { organizationId: invoice.organizationId, invoiceId: invoice.id, amount: due, currency: invoice.currency || 'INR', status: 'PENDING', method: 'RAZORPAY', reference: 'rzp_order_' + order.id }
    });
    return Response.json({ data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId, invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber } }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to initiate online payment',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
