import { db } from '../../../../src/lib/db';
import { hashPassword, createSession } from '../../../../src/lib/auth';

export async function POST(req) {
  try {
    const { name, phone, password, email, customerType, tradeName } = await req.json();
    const normalizedPhone = String(phone || '').replace(/\D/g, '');
    if (!name?.trim() || normalizedPhone.length < 10 || !password || password.length < 8) {
      return Response.json({ error: 'name, valid mobile number and password (8+ characters) are required' }, { status: 400 });
    }
    const existingPhone = await db.user.findUnique({ where: { phone: normalizedPhone } });
    if (existingPhone) return Response.json({ error: 'An account with this mobile number already exists' }, { status: 409 });

    const normalizedEmail = email?.trim().toLowerCase() || `${normalizedPhone}@customer.cleanops.local`;
    const existingEmail = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) return Response.json({ error: 'An account with these details already exists' }, { status: 409 });

    const displayOrg = customerType === 'BUSINESS'
      ? (tradeName?.trim() || `${name.trim()}'s Business`)
      : `${name.trim()} — Personal Services`;
    const org = await db.organization.create({ data: { name: displayOrg } });
    const user = await db.user.create({ data: {
      name: name.trim(), phone: normalizedPhone, email: normalizedEmail,
      passwordHash: await hashPassword(password), role: 'CLIENT_MANAGER', organizationId: org.id
    }});
    await createSession({ userId: user.id, organizationId: org.id, role: user.role });
    return Response.json({ data: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, organizationId: org.id } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to create account' }, { status: 500 });
  }
}
