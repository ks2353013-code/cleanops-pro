import { db } from '../../../../src/lib/db';
import { getSession } from '../../../../src/lib/auth';

export async function POST(req,{params}){
  const user=await getSession(); if(!user)return Response.json({error:'UNAUTHENTICATED'},{status:401});
  if(!['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR'].includes(user.role))return Response.json({error:'FORBIDDEN'},{status:403});
  const {workerIds=[]}=await req.json(); if(!Array.isArray(workerIds)||workerIds.length===0)return Response.json({error:'workerIds required'},{status:400});
  const jobId=(await params).id;
  const job=await db.job.findFirst({where:{id:jobId,...(user.role==='PLATFORM_ADMIN'?{}:{organizationId:user.organizationId})}});
  if(!job)return Response.json({error:'JOB_NOT_FOUND'},{status:404});
  const updated=await db.job.update({where:{id:job.id},data:{status:'SCHEDULED',workerIds}});
  return Response.json({data:updated});
}
