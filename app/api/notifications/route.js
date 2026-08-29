const notifications=[];
export async function GET(){return Response.json({data:notifications});}
export async function POST(req){const b=await req.json(); if(!b.userId||!b.title||!b.message) return Response.json({error:'userId, title and message are required'},{status:400}); const n={id:`NTF-${Date.now().toString().slice(-6)}`,userId:b.userId,title:String(b.title),message:String(b.message),read:false,createdAt:new Date().toISOString()}; notifications.unshift(n); return Response.json({data:n},{status:201});}
