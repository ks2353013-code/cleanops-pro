import { db } from '../../../../src/lib/db';
import { verifyPassword, createSession } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ error: 'email and password are required' }, { status: 400 });
    const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    await createSession({ userId: user.id, organizationId: user.organizationId, role: user.role });
    return Response.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId } });
  } catch (error) { console.error(error); return Response.json({ error: 'Unable to sign in' }, { status: 500 }); }
}
