import { buildContract, contractStatus } from '../../../../src/lib/contracts';
export async function POST(req){try{const b=await req.json();const contract=buildContract(b);return Response.json({data:{...contract,currentStatus:contractStatus(contract)}});}catch(e){return Response.json({error:e.message||'Unable to build contract'},{status:400});}}
