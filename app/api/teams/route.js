const teams=[];
export async function GET(){return Response.json({data:teams});}
export async function POST(req){const b=await req.json(); if(!b.name||!b.supervisorId) return Response.json({error:'name and supervisorId are required'},{status:400}); const t={id:`TEAM-${Date.now().toString().slice(-6)}`,name:String(b.name),supervisorId:b.supervisorId,workerIds:Array.isArray(b.workerIds)?b.workerIds:[],status:'active'}; teams.unshift(t); return Response.json({data:t},{status:201});}
