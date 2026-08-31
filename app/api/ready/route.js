import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ready', database: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ status: 'not_ready', database: 'unavailable' }, { status: 503 });
  }
}
