import { nextOccurrences } from '../../../../src/lib/recurrence';
export async function POST(req){try{const b=await req.json();return Response.json({data:nextOccurrences({startDate:b.startDate,frequency:b.frequency,days:b.days,count:Math.min(30,Number(b.count||8))})});}catch(e){return Response.json({error:e.message||'Unable to preview schedule'},{status:400});}}
