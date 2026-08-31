import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { db } from './db';

const COOKIE='cleanops_session';
const secret=()=>process.env.SESSION_SECRET||process.env.AUTH_SECRET||'change-this-in-production';
const b64=(v)=>Buffer.from(v).toString('base64url');
const unb64=(v)=>Buffer.from(v,'base64url');

export function hashPassword(password){const salt=crypto.randomBytes(16);const hash=crypto.pbkdf2Sync(password,salt,120000,64,'sha512');return `${b64(salt)}.${b64(hash)}`;}
export function verifyPassword(password,stored){try{const [s,e]=String(stored).split('.');const actual=crypto.pbkdf2Sync(password,unb64(s),120000,64,'sha512');return crypto.timingSafeEqual(actual,unb64(e));}catch{return false;}}
export function signSession(payload){const body=b64(Buffer.from(JSON.stringify({...payload,iat:Date.now(),exp:Date.now()+1000*60*60*12})));const sig=crypto.createHmac('sha256',secret()).update(body).digest('base64url');return `${body}.${sig}`;}
export function verifySession(token){try{const [body,sig]=String(token).split('.');if(!body||!sig)return null;const expected=crypto.createHmac('sha256',secret()).update(body).digest('base64url');if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;const data=JSON.parse(unb64(body));return data.exp>Date.now()?data:null;}catch{return null;}}
export async function createSession(payload){const store=await cookies();store.set(COOKIE,signSession(payload),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*12});}
export async function getSession(){const store=await cookies();const raw=store.get(COOKIE)?.value;const s=verifySession(raw);if(!s?.userId)return null;return db.user.findUnique({where:{id:s.userId},select:{id:true,name:true,email:true,phone:true,role:true,organizationId:true,active:true}}).then(u=>u?.active?u:null);}
export async function requireUser(){const u=await getSession();if(!u)throw new Error('UNAUTHENTICATED');return u;}
export async function destroySession(){const store=await cookies();store.delete(COOKIE);}
export {COOKIE};
