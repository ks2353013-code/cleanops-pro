import { buildInvoice } from '../../../../src/lib/billing';
export async function POST(req){try{const b=await req.json();return Response.json({data:buildInvoice(b)});}catch(e){return Response.json({error:e.message||'Unable to build invoice'},{status:400});}}
