const quotes = [];
export async function GET(){ return Response.json({data:quotes}); }
export async function POST(req){ const b=await req.json(); if(!b.requestId||!b.amount) return Response.json({error:'requestId and amount are required'},{status:400}); const q={id:`QUO-${Date.now().toString().slice(-6)}`,requestId:b.requestId,amount:Number(b.amount),frequency:b.frequency||'MONTHLY',status:'draft'}; quotes.unshift(q); return Response.json({data:q},{status:201}); }
