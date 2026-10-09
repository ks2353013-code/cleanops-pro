import { prisma } from '../../../lib/prisma';
import { requireUser, hashPassword } from '../../../src/lib/auth';

const ALLOWED_STATUSES = ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];
const OPS = ['PLATFORM_ADMIN', 'OPERATIONS_MANAGER', 'SUPERVISOR'];
const fail = (message, status = 400) => Response.json({ error: message }, { status });

export async function GET() {
  try {
    const actor = await requireUser();
    if (!OPS.includes(actor.role) && actor.role !== 'PROFESSIONAL') return fail('Workforce access required', 403);
    const where = actor.role === 'PLATFORM_ADMIN' ? {} : actor.role === 'PROFESSIONAL'
      ? { userId: actor.id }
      : { user: { organizationId: actor.organizationId } };
    const workers = await prisma.worker.findMany({ where, include: { user: true }, orderBy: { user: { createdAt: 'desc' } } });
    return Response.json({ data: workers.map(w => ({
      id: w.id, name: w.user.name, email: w.user.email, phone: w.user.phone,
      classification: w.classification, specialization: w.specialization, status: w.status,
      rating: Number(w.rating), jobsCompleted: w.jobsCompleted, active: w.user.active, verifiedAt: w.verifiedAt
    })) });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to load professionals',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}

export async function POST(req) {
  try {
    const actor = await requireUser();
    if (!OPS.includes(actor.role)) return fail('Operations access required', 403);
    let body;
    try { body = await req.json(); } catch { return fail('Request body must be valid JSON', 400); }
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 30) : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
    const temporaryPassword = typeof body.temporaryPassword === 'string' ? body.temporaryPassword : '';
    if (!name || !phone || !email) return fail('Name, mobile number and email are required', 400);
    if (temporaryPassword.length < 12 || temporaryPassword.length > 128) return fail('Set a temporary password of 12–128 characters', 400);
    const classification = String(body.classification || 'Cleaning Professional').trim().slice(0, 120);
    const specialization = String(body.specialization || 'General Cleaning').trim().slice(0, 120);
    const requestedStatus = String(body.status || 'PENDING').toUpperCase();
    if (!ALLOWED_STATUSES.includes(requestedStatus)) return fail('Invalid professional status', 400);
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) return fail('A user with this email or mobile number already exists', 409);
    const status = requestedStatus === 'ACTIVE' ? 'PENDING' : requestedStatus;
    const user = await prisma.user.create({
      data: {
        organizationId: actor.role === 'PLATFORM_ADMIN' ? (body.organizationId || null) : actor.organizationId,
        name, email, phone, passwordHash: hashPassword(temporaryPassword),
        role: 'PROFESSIONAL', active: status !== 'INACTIVE' && status !== 'SUSPENDED',
        worker: { create: { classification, specialization, status, verifiedAt: status === 'VERIFIED' ? new Date() : null } }
      },
      include: { worker: true }
    });
    if (user.organizationId) await prisma.auditEvent.create({ data: {
      organizationId: user.organizationId, actorUserId: actor.id, action: 'PROFESSIONAL_CREATED',
      entityType: 'Worker', entityId: user.worker.id, metadata: { status: user.worker.status }
    }});
    return Response.json({ data: {
      id: user.worker.id, name: user.name, email: user.email, phone: user.phone,
      classification: user.worker.classification, specialization: user.worker.specialization,
      status: user.worker.status, active: user.active
    } }, { status: 201 });
  } catch (e) {
    return fail(e?.message === 'UNAUTHENTICATED' ? 'Authentication required' : 'Unable to add professional',
      e?.message === 'UNAUTHENTICATED' ? 401 : 500);
  }
}
