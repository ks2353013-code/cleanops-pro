import { getSession } from './auth';
import { db } from './db';

export async function getTenantContext(){
  const user=await getSession();
  if(!user) return null;
  return {userId:user.userId||user.id, role:user.role, organizationId:user.organizationId||null};
}

export async function requireTenant(){
  const ctx=await getTenantContext();
  if(!ctx) throw new Error('UNAUTHENTICATED');
  if(ctx.role!=='PLATFORM_ADMIN'&&!ctx.organizationId) throw new Error('TENANT_REQUIRED');
  return ctx;
}

export function organizationFilter(ctx){
  return ctx.role==='PLATFORM_ADMIN'?{}:{organizationId:ctx.organizationId};
}

export async function writeAudit(ctx, action, entityType, entityId, metadata={}){
  return db.auditEvent.create({data:{organizationId:ctx.organizationId,actorUserId:ctx.userId,action,entityType,entityId,metadata}});
}
