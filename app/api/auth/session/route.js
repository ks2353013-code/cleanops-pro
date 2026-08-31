import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('cleanops_session');
  return Response.json({ authenticated: Boolean(session), role: session ? 'PLATFORM_ADMIN' : null });
}
