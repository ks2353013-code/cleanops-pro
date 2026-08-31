import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../src/lib/auth';

const OPS_ROLES=['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR'];
export async function GET(){
  try{
    const user=await requireUser();
    if(!OPS_ROLES.includes(user.role)) return Response.json({error:'Forbidden'},{status:403});
    const organizationFilter=user.role==='PLATFORM_ADMIN'?{}:{organizationId:user.organizationId};
    const facilityFilter=user.role==='PLATFORM_ADMIN'?{}:{organizationId:user.organizationId};
    const [organizations,facilities,requests,contracts,jobs,workers,invoices]=await Promise.all([
      user.role==='PLATFORM_ADMIN'?prisma.organization.count():Promise.resolve(1),
      prisma.facility.count({where:facilityFilter}),
      prisma.serviceRequest.findMany({where:{...organizationFilter,status:{in:['NEW','ASSESSMENT','QUOTED']}},include:{facility:true},orderBy:{createdAt:'desc'},take:20}),
      prisma.contract.count({where:{...organizationFilter,status:'ACTIVE'}}),
      prisma.job.findMany({where:{facility:facilityFilter,scheduledStart:{gte:new Date(new Date().setHours(0,0,0,0))},},include:{facility:true,worker:{include:{user:true}},contract:true},orderBy:{scheduledStart:'asc'},take:50}),
      prisma.worker.count({where:{status:'ACTIVE',user:user.role==='PLATFORM_ADMIN'?undefined:{organizationId:user.organizationId}}}),
      prisma.invoice.findMany({where:{...organizationFilter,status:{not:'PAID'}},orderBy:{dueDate:'asc'},take:50})
    ]);
    const outstanding=invoices.reduce((s,x)=>s+Number(x.amount),0);
    return Response.json({data:{counts:{organizations,facilities,requests:requests.length,activeContracts:contracts,jobsToday:jobs.length,activeWorkers:workers,outstanding:Number(outstanding.toFixed(2))},requests,jobs,invoices}});
  }catch(e){const status=e.message==='UNAUTHENTICATED'?401:500;return Response.json({error:status===401?'Authentication required':'Operations data unavailable',detail:process.env.NODE_ENV==='development'?e.message:undefined},{status});}
}
