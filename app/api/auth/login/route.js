import { db } from '../../../../src/lib/db';
import { verifyPassword, createSession } from '../../../../src/lib/auth';

function normalizePhone(value){return String(value||'').replace(/\D/g,'').replace(/^91(?=\d{10}$)/,'');}
export async function POST(req){
  try{
    const {identifier,email,phone,password}=await req.json();
    const raw=identifier||phone||email||'';
    const normalizedPhone=normalizePhone(raw);
    const user=normalizedPhone.length===10
      ? await db.user.findUnique({where:{phone:normalizedPhone}})
      : await db.user.findUnique({where:{email:String(raw).toLowerCase().trim()}});
    if(!user||!user.active||!(await verifyPassword(String(password||''),user.passwordHash)))return Response.json({error:'Invalid mobile number or password'},{status:401});
    await createSession({userId:user.id,organizationId:user.organizationId,role:user.role});
    return Response.json({data:{id:user.id,name:user.name,phone:user.phone,email:user.email,role:user.role,organizationId:user.organizationId}});
  }catch(error){console.error(error);return Response.json({error:'Unable to sign in'},{status:500});}
}