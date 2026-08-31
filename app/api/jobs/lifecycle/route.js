import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const OPS_ROLES=['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR'];
const TRANSITIONS={SCHEDULED:['CHECKED_IN','CANCELLED'],CHECKED_IN:['IN_PROGRESS','MISSED','CANCELLED'],IN_PROGRESS:['INSPECTION','MISSED','CANCELLED'],INSPECTION:['COMPLETED','IN_PROGRESS'],MISSED:[],COMPLETED:[],CANCELLED:[]};

function error(message,status=400){return Response.json({error:message},{status});}

export async function POST(req){
  try{
    const user=await requireUser();
    const body=await req.json();
    if(!body.jobId||!body.action)return error('jobId and action are required');
    const job=await prisma.job.findFirst({where:{id:body.jobId,...(user.role==='PLATFORM_ADMIN'?{}:{facility:{organizationId:user.organizationId}})},include:{facility:true,worker:{include:{user:true}}}});
    if(!job)return error('Job not found',404);
    const action=String(body.action).toLowerCase();
    const now=new Date();

    if(action==='checkin'){
      if(user.role!=='PROFESSIONAL'||!job.worker||job.worker.userId!==user.id)return error('Only the assigned professional can check in',403);
      if(!['SCHEDULED','CHECKED_IN'].includes(job.status))return error('Job is not available for check-in');
      const updated=await prisma.job.update({where:{id:job.id},data:{status:'IN_PROGRESS',checkInAt:job.checkInAt||now}});
      await prisma.auditEvent.create({data:{organizationId:job.facility.organizationId,actorUserId:user.id,action:'JOB_CHECKED_IN',entityType:'Job',entityId:job.id,metadata:{latitude:body.latitude??null,longitude:body.longitude??null}}});
      return Response.json({data:updated});
    }

    if(action==='checkout'){
      if(user.role!=='PROFESSIONAL'||!job.worker||job.worker.userId!==user.id)return error('Only the assigned professional can check out',403);
      if(job.status!=='IN_PROGRESS')return error('Job is not in progress');
      const completed=body.completed!==false;
      const updated=await prisma.job.update({where:{id:job.id},data:{status:completed?'INSPECTION':'MISSED',checkOutAt:now,completedAt:completed?null:null}});
      await prisma.auditEvent.create({data:{organizationId:job.facility.organizationId,actorUserId:user.id,action:completed?'JOB_SUBMITTED_FOR_INSPECTION':'JOB_MARKED_MISSED',entityType:'Job',entityId:job.id,metadata:{}}});
      return Response.json({data:updated});
    }

    if(action==='transition'){
      if(!OPS_ROLES.includes(user.role))return error('Forbidden',403);
      const to=String(body.to||'').toUpperCase();
      if(!TRANSITIONS[job.status]?.includes(to))return error(`Invalid transition: ${job.status} -> ${to}`);
      const updated=await prisma.job.update({where:{id:job.id},data:{status:to,completedAt:to==='COMPLETED'?now:job.completedAt}});
      await prisma.auditEvent.create({data:{organizationId:job.facility.organizationId,actorUserId:user.id,action:'JOB_STATUS_CHANGED',entityType:'Job',entityId:job.id,metadata:{from:job.status,to}}});
      return Response.json({data:updated});
    }

    return error('Unsupported action');
  }catch(e){
    const status=e.message==='UNAUTHENTICATED'?401:500;
    return error(status===401?'Authentication required':'Unable to update job',status);
  }
}
