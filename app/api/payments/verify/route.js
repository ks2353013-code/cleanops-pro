import crypto from 'node:crypto';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function POST(req) {
  try {
    const user = await requireUser();
    if (!['CUSTOMER', 'CLIENT_MANAGER', 'PLATFORM_ADMIN', 'OPERATIONS_MANAGER'].includes(user.role)) return fail('Payment access required', 403);
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return fail('Online payments are not configured yet', 503);
    const body = await req.json();
    const orderId = typeof body.razorpay_order_id === 'string' ? body.razorpay_order_id : '';
    const paymentId = typeof body.razorpay_payment_id === 'string' ? body.razorpay_payment_id : '';
    const signature = typeof body.razorpay_signature === 'string' ? body.razorpay_signature : '';
    if (!orderId || !paymentId || !signature) return fail('Razorpay order, payment and signature are required', 400);
    const expected = crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex');
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) return fail('Payment signature verification failed', 400);
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) return fail('Online payments are not configured yet', 503);
    const providerResponse = await fetch('https://api.razorpay.com/v1/payments/' + encodeURIComponent(paymentId), {
      headers: { Authorization: 'Basic ' + Buffer.from(keyId + ':' + secret).toString('base64') },
      cache: 'no-store'
    });
    const providerPayment = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok || providerPayment.order_id !== orderId) return fail('Payment provider could not confirm this payment', 502);
    if (providerPayment.status !== 'captured') return fail('Payment has not been captured yet; invoice remains unpaid', 409);
    const pending = await prisma.payment.findUnique({ where: { reference: 'rzp_order_' + orderId }, include: { invoice: true } });
    if (!pending || (user.role !== 'PLATFORM_ADMIN' && pending.organizationId !== user.organizationId)) return fail('Payment order not found', 404);
    if (pending.status === 'SUCCESS') return Response.json({ data: { status: 'SUCCESS', invoiceId: pending.invoiceId } });
    if (pending.status !== 'PENDING') return fail('Payment order is no longer payable', 409);
    if (providerPayment.currency !== pending.currency || Number(providerPayment.amount) !== Math.round(Number(pending.amount) * 100)) return fail('Payment amount does not match invoice balance', 409);
    const result = await prisma.$transaction(async tx => {
      const duplicate = await tx.payment.findUnique({ where: { reference: paymentId } });
      if (duplicate) {
        if (duplicate.id === pending.id && duplicate.status === 'SUCCESS') return duplicate;
        throw new Error('PAYMENT_REFERENCE_USED');
      }
      const current = await tx.invoice.findUnique({ where: { id: pending.invoiceId }, include: { payments: true } });
      if (!current || ['VOID', 'CANCELLED'].includes(current.status)) throw new Error('INVOICE_NOT_PAYABLE');
      const paid = current.payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + Number(p.amount), 0);
      if (paid + Number(pending.amount) > Number(current.amount) + 0.01) throw new Error('PAYMENT_EXCEEDS_BALANCE');
      const payment = await tx.payment.update({ where: { id: pending.id }, data: { status: 'SUCCESS', reference: paymentId, paidAt: new Date() } });
      const total = paid + Number(payment.amount);
      const status = total + 0.01 >= Number(current.amount) ? 'PAID' : 'PARTIALLY_PAID';
      await tx.invoice.update({ where: { id: current.id }, data: { status, paidAt: status === 'PAID' ? new Date() : null } });
      await tx.auditEvent.create({ data: { organizationId: current.organizationId, actorUserId: user.id, action: 'RAZORPAY_PAYMENT_VERIFIED', entityType: 'Payment', entityId: payment.id, metadata: { invoiceId: current.id, orderId, paymentId, status } } });
      return payment;
    });
    return Response.json({ data: { status: result.status, invoiceId: result.invoiceId } });
  } catch (e) {
    const status = e?.message === 'UNAUTHENTICATED' ? 401 : ['PAYMENT_REFERENCE_USED', 'INVOICE_NOT_PAYABLE', 'PAYMENT_EXCEEDS_BALANCE'].includes(e?.message) ? 409 : 500;
    return fail(status === 401 ? 'Authentication required' : status === 409 ? 'Payment could not be applied to this invoice' : 'Unable to verify payment',
      status);
  }
}
