import { db } from '../../../../src/lib/db';
import { hashPassword, createSession } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
    const { name, email, password, organizationName } = await req.json();
    if (!name || !email || !password || password.length < 8) return Response.json({ error: 'name, email and password (8+ characters) are required' }, { status: 400 });
    const normalized = email.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email: normalized } });
    if (existing) return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
    const org = await db.organization.create({ data: { name: organizationName?.trim() || `${name.trim()}'s Organization` } });
    const user = await db.user.create({ data: { name: name.trim(), email: normalized, passwordHash: await hashPassword(password), role: 'CLIENT_MANAGER', organizationId: org.id } });
    await createSession({ userId: user.id, organizationId: org.id, role: user.role });
    return Response.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: org.id } }, { status: 201 });
  } catch (error) { console.error(error); return Response.json({ error: 'Unable to create account' }, { status: 500 }); }
}
