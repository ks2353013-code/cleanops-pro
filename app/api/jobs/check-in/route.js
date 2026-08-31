import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

export async function POST(req){
  try{
    const user=await requireUser();
    if(user.role!=='PROFESSIONAL') return Response.json({error:'Forbidden'},{status:403});
    const {jobId}=await req.json();
    if(!jobId) return Response.json({error:'jobId is required'},{status:400});
    const worker=await prisma.worker.findFirst({where:{userId:user.id, status:{in:['ACTIVE','VERIFIED']}}});
    if(!worker) return Response.json({error:'Professional profile not found'},{status:404});
    const job=await prisma.job.findFirst({where:{id:jobId,workerId:worker.id,facility:{organizationId:user.organizationId}}});
    if(!job) return Response.json({error:'Assigned job not found'},{status:404});
    if(!['SCHEDULED'].includes(job.status)) return Response.json({error:'Job is not ready for check-in'},{status:409});
    const updated=await prisma.job.update({where:{id:job.id},data:{status:'CHECKED_IN',checkInAt:new Date()}});
    return Response.json({data:{id:updated.id,status:updated.status,checkInAt:updated.checkInAt}});
  }catch(e){return Response.json({error:e.message==='UNAUTHENTICATED'?'Authentication required':'Unable to check in'},{status:e.message==='UNAUTHENTICATED'?401:500});}
}
