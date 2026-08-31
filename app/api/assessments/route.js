import { assessSite } from '../../../src/lib/assessment';
export async function POST(req){try{const body=await req.json();if(!body.areaSqFt||!body.facilityType)return Response.json({error:'areaSqFt and facilityType are required'},{status:400});return Response.json({data:assessSite(body)});}catch{return Response.json({error:'Unable to assess site'},{status:400});}}
