import { calculateQuote } from '../../../../src/lib/pricing';
export async function POST(req){try{const body=await req.json();const result=calculateQuote(body);return Response.json({data:result});}catch{ return Response.json({error:'Unable to calculate quote'},{status:400});}}
