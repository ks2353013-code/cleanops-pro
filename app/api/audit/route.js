const events=[];
export async function GET(){return Response.json({data:events});}
export async function POST(req){const b=await req.json(); if(!b.actorId||!b.action) return Response.json({error:'actorId and action are required'},{status:400}); const e={id:`AUD-${Date.now().toString().slice(-6)}`,actorId:b.actorId,action:String(b.action),entityType:b.entityType||null,entityId:b.entityId||null,metadata:b.metadata||{},createdAt:new Date().toISOString()}; events.unshift(e); return Response.json({data:e},{status:201});}
