export async function GET() {
  return Response.json({ status: 'ok', service: 'cleanops-pro', timestamp: new Date().toISOString() });
}
