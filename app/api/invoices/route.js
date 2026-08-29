const invoices=[];
export async function GET(){return Response.json({data:invoices});}
export async function POST(req){const b=await req.json(); if(!b.organizationId||!b.amount) return Response.json({error:'organizationId and amount are required'},{status:400}); const i={id:`INV-${Date.now().toString().slice(-6)}`,organizationId:b.organizationId,contractId:b.contractId||null,amount:Number(b.amount),currency:b.currency||'INR',dueDate:b.dueDate||null,status:'issued',issuedAt:new Date().toISOString()}; invoices.unshift(i); return Response.json({data:i},{status:201});}
export async function PATCH(req){const b=await req.json(); if(!b.id) return Response.json({error:'id is required'},{status:400}); return Response.json({data:{id:b.id,status:b.status||'paid',paidAt:new Date().toISOString()}});}
