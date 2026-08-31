import { validateEvidence, evidenceStatus } from '../../../../src/lib/evidence';
export async function POST(req){try{const b=await req.json();const evidence=validateEvidence(b);return Response.json({data:{evidence,status:evidenceStatus(evidence,Number(b.requiredEvidence||1))}});}catch(e){return Response.json({error:e.message||'Invalid evidence'},{status:400});}}
