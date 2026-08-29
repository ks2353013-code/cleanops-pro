import { cookies } from 'next/headers';

const COOKIE = 'cleanops_session';
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || 'change-this-in-production');

function toBase64(bytes) { return Buffer.from(bytes).toString('base64url'); }
function fromBase64(value) { return new Uint8Array(Buffer.from(value, 'base64url')); }

export async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, material, 256);
  return `${toBase64(salt)}.${toBase64(new Uint8Array(bits))}`;
}

export async function verifyPassword(password, stored) {
  const [salt, expected] = String(stored).split('.');
  if (!salt || !expected) return false;
  const actual = await hashPassword(password, fromBase64(salt));
  return actual === `${salt}.${expected}`;
}

export async function createSession(payload) {
  const body = toBase64(new TextEncoder().encode(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })));
  const key = await crypto.subtle.importKey('raw', secret(), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = toBase64(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))));
  const store = await cookies();
  store.set(COOKIE, `${body}.${sig}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
}

export async function getSession() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const [body, sig] = raw.split('.');
  try {
    const key = await crypto.subtle.importKey('raw', secret(), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, fromBase64(sig), new TextEncoder().encode(body));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64(body)));
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}
