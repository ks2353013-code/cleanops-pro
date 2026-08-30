import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

export async function POST(req){
  try{
    const user=await requireUser();
    if(!user.organizationId) return Response.json({error:'Organization context required'},{status:403});
    if(!['CLIENT_MANAGER','OPERATIONS_MANAGER','SUPERVISOR','PLATFORM_ADMIN'].includes(user.role)) return Response.json({error:'Forbidden'},{status:403});
    const b=await req.json();
    if(!b.facilityId||!b.serviceName) return Response.json({error:'facilityId and serviceName are required'},{status:400});
    const facility=await prisma.facility.findFirst({where:{id:b.facilityId,organizationId:user.organizationId}});
    if(!facility) return Response.json({error:'Facility not found'},{status:404});
    const request=await prisma.serviceRequest.create({data:{organizationId:user.organizationId,facilityId:b.facilityId,serviceName:String(b.serviceName).trim().slice(0,200),requirements:b.requirements?String(b.requirements).trim().slice(0,5000):null,preferredDate:b.preferredDate?new Date(b.preferredDate):null,status:'NEW'}});
    await prisma.auditEvent.create({data:{organizationId:user.organizationId,actorUserId:user.id,action:'SERVICE_REQUEST_CREATED',entityType:'ServiceRequest',entityId:request.id,metadata:{facilityId:facility.id,serviceName:request.serviceName}}});
    return Response.json({data:request},{status:201});
  }catch(e){const status=e.message==='UNAUTHENTICATED'?401:400;return Response.json({error:status===401?'Authentication required':'Unable to create service request'},{status});}
}
