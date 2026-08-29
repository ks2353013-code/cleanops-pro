import { db } from '../../../src/lib/db';
import { getSession } from '../../../src/lib/auth';

export async function GET(){
  const user=await getSession();
  if(!user) return Response.json({error:'UNAUTHENTICATED'},{status:401});
  const where=user.role==='PLATFORM_ADMIN'?{}:{organizationId:user.organizationId};
  const [facilities,workers,requests,contracts]=await Promise.all([
    db.facility.count({where}),
    db.worker.count({where}),
    db.serviceRequest.count({where}),
    db.contract.count({where})
  ]);
  return Response.json({data:{facilities,workers,requests,contracts,organizationId:user.organizationId}});
}
