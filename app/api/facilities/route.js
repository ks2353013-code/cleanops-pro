import { db } from '../../../src/lib/db';
import { requireUser } from '../../../src/lib/auth';

export async function GET() {
  try {
    const user=await requireUser();
    if(!user.organizationId) return Response.json({error:'Organization context required'},{status:403});
    const data=await db.facility.findMany({where:{organizationId:user.organizationId},orderBy:{createdAt:'desc'}});
    return Response.json({data});
  } catch(e) { return Response.json({error:e.message==='UNAUTHENTICATED'?'Authentication required':'Unable to load facilities'},{status:e.message==='UNAUTHENTICATED'?401:500}); }
}

export async function POST(req) {
  try {
    const user=await requireUser();
    if(!user.organizationId) return Response.json({error:'Organization context required'},{status:403});
    if(!['CLIENT_MANAGER','OPERATIONS_MANAGER','SUPERVISOR','PLATFORM_ADMIN'].includes(user.role)) return Response.json({error:'Forbidden'},{status:403});
    const body=await req.json();
    for(const key of ['name','type','address']) if(!body[key]) return Response.json({error:`${key} is required`},{status:400});
    const data=await db.facility.create({data:{organizationId:user.organizationId,name:String(body.name).trim().slice(0,200),type:body.type,address:String(body.address).trim().slice(0,1000),areaSqFt:body.areaSqFt?Number(body.areaSqFt):undefined,operatingHours:body.operatingHours?String(body.operatingHours).slice(0,500):undefined,riskProfile:body.riskProfile?String(body.riskProfile).slice(0,1000):undefined}});
    await db.auditEvent.create({data:{organizationId:user.organizationId,actorUserId:user.id,action:'FACILITY_CREATED',entityType:'Facility',entityId:data.id,metadata:{type:data.type}}});
    return Response.json({data},{status:201});
  } catch(e) { return Response.json({error:e.message==='UNAUTHENTICATED'?'Authentication required':'Unable to create facility'},{status:e.message==='UNAUTHENTICATED'?401:400}); }
}
