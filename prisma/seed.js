import crypto from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
const connectionString=process.env.DATABASE_URL;
if(!connectionString) throw new Error('DATABASE_URL is required for seeding');
const adapter=new PrismaPg({connectionString});const db=new PrismaClient({adapter});
function hashPassword(password){const salt=crypto.randomBytes(16);const hash=crypto.pbkdf2Sync(password,salt,120000,64,'sha512');return `${salt.toString('base64url')}.${hash.toString('base64url')}`;}
async function main(){const org=await db.organization.upsert({where:{id:'demo-org'},update:{},create:{id:'demo-org',name:'CleanOps Demo Operations'}});await db.facility.upsert({where:{id:'demo-facility'},update:{},create:{id:'demo-facility',organizationId:org.id,name:'Greenfield International School',type:'SCHOOL',address:'Demo Campus',areaSqFt:45000,operatingHours:'07:00-19:00',riskProfile:'MEDIUM'}});
 const email=process.env.CLEANOPS_BOOTSTRAP_TEAM_EMAIL?.trim().toLowerCase();const password=process.env.CLEANOPS_BOOTSTRAP_TEAM_PASSWORD; if(email&&password){const existing=await db.user.findUnique({where:{email}});if(existing){await db.user.update({where:{id:existing.id},data:{name:'CleanOps Operations Admin',role:'PLATFORM_ADMIN',active:true,passwordHash:hashPassword(password),organizationId:org.id}});}else{await db.user.create({data:{name:'CleanOps Operations Admin',email,passwordHash:hashPassword(password),role:'PLATFORM_ADMIN',organizationId:org.id}});}console.log(`Bootstrapped team admin ${email}`);}else console.log('Team bootstrap skipped: set CLEANOPS_BOOTSTRAP_TEAM_EMAIL and CLEANOPS_BOOTSTRAP_TEAM_PASSWORD to create an internal admin.');console.log(`Seeded ${org.name}`);}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>db.$disconnect());
