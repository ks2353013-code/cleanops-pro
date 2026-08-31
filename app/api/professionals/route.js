import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = globalThis.__cleanopsPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__cleanopsPrisma = prisma;

const ALLOWED_STATUSES = ['PENDING','VERIFIED','ACTIVE','SUSPENDED','INACTIVE'];

export async function GET(){
  try{
    const workers=await prisma.worker.findMany({include:{user:true},orderBy:{user:{createdAt:'desc'}}});
    return Response.json({data:workers.map(w=>({id:w.id,name:w.user.name,email:w.user.email,phone:w.user.phone,classification:w.classification,specialization:w.specialization,status:w.status,rating:Number(w.rating),jobsCompleted:w.jobsCompleted,active:w.user.active,verifiedAt:w.verifiedAt}))});
  }catch(e){return Response.json({error:e.message||'Unable to load professionals'},{status:500});}
}

export async function POST(req){
  try{
    const b=await req.json();
    if(!b.name||!b.phone) return Response.json({error:'Name and mobile number are required.'},{status:400});
    const classification=String(b.classification||'Cleaning Professional').trim();
    const specialization=String(b.specialization||'General Cleaning').trim();
    const status=ALLOWED_STATUSES.includes(String(b.status||'ACTIVE').toUpperCase())?String(b.status||'ACTIVE').toUpperCase():'ACTIVE';
    const normalizedPhone=String(b.phone).trim();
    const email=String(b.email||`professional-${Date.now()}@cleanops.local`).trim().toLowerCase();
    const existing=await prisma.user.findFirst({where:{OR:[{email},{phone:normalizedPhone}]}});
    if(existing) return Response.json({error:'A professional with this email or mobile number already exists.'},{status:409});
    const passwordHash=crypto.createHash('sha256').update(String(b.temporaryPassword||crypto.randomUUID())).digest('hex');
    const user=await prisma.user.create({data:{name:String(b.name).trim(),email,phone:normalizedPhone,passwordHash,role:'PROFESSIONAL',active:status==='ACTIVE'||status==='VERIFIED',worker:{create:{classification,specialization,status,verifiedAt:['VERIFIED','ACTIVE'].includes(status)?new Date():null}}},include:{worker:true}});
    return Response.json({data:{id:user.worker.id,name:user.name,email:user.email,phone:user.phone,classification:user.worker.classification,specialization:user.worker.specialization,status:user.worker.status}},{status:201});
  }catch(e){return Response.json({error:e.message||'Unable to add professional'},{status:500});}
}
