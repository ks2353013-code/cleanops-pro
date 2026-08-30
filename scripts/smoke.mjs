const base = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

async function check(path, expectedStatus) {
  const r = await fetch(`${base}${path}`);
  const text = await r.text();
  if (r.status !== expectedStatus) throw new Error(`${path}: expected ${expectedStatus}, got ${r.status}: ${text}`);
  console.log(`PASS ${path} (${r.status})`);
}

await check('/api/health', 200);
await check('/api/ready', 200);
console.log(`Smoke checks passed for ${base}`);
