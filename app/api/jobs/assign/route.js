import { db } from '../../../../src/lib/db';
import { getSession } from '../../../../src/lib/auth';

export async function POST(req,{params}){
  const user=await getSession();
  if(!user)return Response.json({error:'UNAUTHENTICATED'},{status:401});
  if(!['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR'].includes(user.role))return Response.json({error:'FORBIDDEN'},{status:403});

  const {workerIds=[]}=await req.json();
  if(!Array.isArray(workerIds)||workerIds.length===0)return Response.json({error:'workerIds required'},{status:400});
  const uniqueWorkerIds=[...new Set(workerIds.map(String).filter(Boolean))];
  const jobId=(await params).id;
  const job=await db.job.findFirst({where:{id:jobId,...(user.role==='PLATFORM_ADMIN'?{}:{facility:{organizationId:user.organizationId}})}});
  if(!job)return Response.json({error:'JOB_NOT_FOUND'},{status:404});

  const workers=await db.worker.findMany({
    where:{id:{in:uniqueWorkerIds},status:{in:['ACTIVE','VERIFIED']},user:{organizationId:user.organizationId}},
    select:{id:true},
  });
  if(workers.length!==uniqueWorkerIds.length)return Response.json({error:'One or more professionals are unavailable'},{status:409});

  const updated=await db.$transaction(async tx=>{
    const first=await tx.job.update({where:{id:job.id},data:{status:'SCHEDULED',workerId:workers[0].id}});
    const additional=[];
    for(const worker of workers.slice(1)){
      additional.push(await tx.job.create({data:{facilityId:job.facilityId,contractId:job.contractId,workerId:worker.id,scheduledStart:job.scheduledStart,scheduledEnd:job.scheduledEnd,status:'SCHEDULED'}}));
    }
    return [first,...additional];
  });

  return Response.json({data:updated,staffingCount:updated.length});
}
