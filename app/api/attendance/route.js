const attendance=[];
export async function GET(){return Response.json({data:attendance});}
export async function POST(req){const b=await req.json(); if(!b.jobId||!b.workerId||!['check_in','check_out'].includes(b.action)) return Response.json({error:'jobId, workerId and valid action are required'},{status:400}); const a={id:`ATT-${Date.now().toString().slice(-6)}`,jobId:b.jobId,workerId:b.workerId,action:b.action,latitude:b.latitude??null,longitude:b.longitude??null,at:new Date().toISOString()}; attendance.unshift(a); return Response.json({data:a},{status:201});}
