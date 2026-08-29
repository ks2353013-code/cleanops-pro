const complaints=[];
export async function GET(){return Response.json({data:complaints});}
export async function POST(req){const b=await req.json(); if(!b.organizationId||!b.description) return Response.json({error:'organizationId and description are required'},{status:400}); const c={id:`CMP-${Date.now().toString().slice(-6)}`,organizationId:b.organizationId,facilityId:b.facilityId||null,description:String(b.description),severity:b.severity||'medium',status:'open',createdAt:new Date().toISOString()}; complaints.unshift(c); return Response.json({data:c},{status:201});}
