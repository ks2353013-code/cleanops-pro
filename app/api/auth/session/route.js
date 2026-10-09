import { requireUser } from '../../../../src/lib/auth';

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ authenticated: true, role: user.role, user: { id: user.id, name: user.name, email: user.email, organizationId: user.organizationId } });
  } catch {
    return Response.json({ authenticated: false, role: null }, { status: 401 });
  }
}
