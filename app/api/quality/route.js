const inspections=[]; const complaints=[];
export async function GET(){return Response.json({inspections,complaints});}
export async function POST(req){const b=await req.json(); if(!b.jobId||!b.result) return Response.json({error:'jobId and result are required'},{status:400}); const i={id:`INS-${Date.now().toString().slice(-6)}`,jobId:b.jobId,result:b.result,score:Number(b.score||0),notes:String(b.notes||''),createdAt:new Date().toISOString()}; inspections.unshift(i); return Response.json({data:i},{status:201});}
