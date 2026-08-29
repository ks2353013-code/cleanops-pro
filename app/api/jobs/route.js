const jobs=[];
export async function GET(){return Response.json({data:jobs});}
export async function POST(req){const b=await req.json(); if(!b.contractId||!b.facilityId||!b.scheduledFor) return Response.json({error:'contractId, facilityId and scheduledFor are required'},{status:400}); const j={id:`JOB-${Date.now().toString().slice(-6)}`,contractId:b.contractId,facilityId:b.facilityId,scheduledFor:b.scheduledFor,status:'scheduled',workerIds:b.workerIds||[]}; jobs.unshift(j); return Response.json({data:j},{status:201});}
