import crypto from 'node:crypto';
import { db } from '../../../../src/lib/db';
import { createSession, hashPassword } from '../../../../src/lib/auth';

function normalizePhone(value){return String(value||'').replace(/\D/g,'').replace(/^91(?=\d{10}$)/,'');}
export async function POST(req){
  try{
    const {name,phone,password}=await req.json();
    const normalizedPhone=normalizePhone(phone);
    if(!name||normalizedPhone.length!==10||String(password||'').length<6)return Response.json({error:'Name, valid 10-digit mobile number and 6-character password are required'},{status:400});
    const existing=await db.user.findUnique({where:{phone:normalizedPhone}});
    if(existing)return Response.json({error:'This mobile number is already registered. Sign in instead.'},{status:409});
    const org=await db.organization.upsert({where:{id:'cleanops-customer-org'},update:{},create:{id:'cleanops-customer-org',name:'CleanOps Customer Network'}});
    const email=`customer-${normalizedPhone}@customers.cleanops.local`;
    const user=await db.user.create({data:{name:String(name).trim().slice(0,100),phone:normalizedPhone,email,passwordHash:hashPassword(String(password)),role:'CUSTOMER',organizationId:org.id}});
    await createSession({userId:user.id,organizationId:user.organizationId,role:user.role});
    return Response.json({data:{id:user.id,name:user.name,phone:user.phone,role:user.role}} ,{status:201});
  }catch(e){console.error(e);return Response.json({error:'Unable to create customer account'},{status:500});}
}