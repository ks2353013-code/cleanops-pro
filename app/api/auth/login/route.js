import { db } from '../../../../src/lib/db';
import { verifyPassword, createSession } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
    const { identifier, email, phone, password } = await req.json();
    const value = String(identifier || phone || email || '').trim();
    if (!value || !password) return Response.json({ error: 'mobile number and password are required' }, { status: 400 });

    const normalizedPhone = value.replace(/\D/g, '');
    const user = normalizedPhone.length >= 10
      ? await db.user.findUnique({ where: { phone: normalizedPhone } })
      : await db.user.findUnique({ where: { email: value.toLowerCase() } });

    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ error: 'Invalid mobile number or password' }, { status: 401 });
    }
    await createSession({ userId: user.id, organizationId: user.organizationId, role: user.role });
    return Response.json({ data: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, organizationId: user.organizationId } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to sign in' }, { status: 500 });
  }
}
