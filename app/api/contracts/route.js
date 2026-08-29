const contracts=[];
export async function GET(){return Response.json({data:contracts});}
export async function POST(req){const b=await req.json(); if(!b.organizationId||!b.monthlyValue) return Response.json({error:'organizationId and monthlyValue are required'},{status:400}); const c={id:`CON-${Date.now().toString().slice(-6)}`,organizationId:b.organizationId,monthlyValue:Number(b.monthlyValue),startDate:b.startDate||null,endDate:b.endDate||null,status:'pending_approval'}; contracts.unshift(c); return Response.json({data:c},{status:201});}
