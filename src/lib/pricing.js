const CONFIG={
  TARGET_SALARY:30000,
  UTILISATION:0.78,
  EMPLOYER_OVERHEAD:0.10,
  TRAVEL_PER_WORKER:1800,
  CONSUMABLES_PER_WORKER:1800,
  SUPERVISION_PER_WORKER:1200,
  EQUIPMENT_PER_WORKER:700,
  PLATFORM_PER_JOB:500,
  TARGET_MARGIN:0.18,
  ANNUAL_DISCOUNT:0.08
};

const CITY_FACTORS={DELHI_NCR:1.00,MUMBAI:1.12,BENGALURU:1.08,HYDERABAD:1.00,CHENNAI:0.98,PUNE:1.02,KOLKATA:0.95,AHMEDABAD:0.95,JAIPUR:0.92,OTHER:1.00};
const AREA_FACTORS={METRO_CORE:1.10,METRO_OUTER:1.00,TIER_2:0.92,TIER_3:0.86};
const SECTOR_FACTORS={RESIDENTIAL:0.90,OFFICE:1.00,CORPORATE:1.02,SCHOOL:1.08,HOSPITAL:1.42,HOTEL:1.24,FACTORY:1.32,WAREHOUSE:1.10,RETAIL:1.02,OTHER:1.00};
const SERVICE_FACTORS={REGULAR:1,DEEP:1.30,SOFA_CARPET:1.12,GLASS:1.10,FLOOR_CARPET:1.16,SANITISATION:1.22,POST_CONSTRUCTION:1.48,MOVE_IN_OUT:1.28,SPECIALIST:1.40};
const EMPLOYEE_TIERS=[
  {min:1,max:25,workers:1},
  {min:26,max:50,workers:1},
  {min:51,max:100,workers:2},
  {min:101,max:200,workers:3},
  {min:201,max:350,workers:4},
  {min:351,max:500,workers:5},
  {min:501,max:750,workers:7},
  {min:751,max:1000,workers:9}
];
const HOURLY_RATES={RESIDENTIAL:349,OFFICE:449,COMMERCIAL:499,SPECIALIST:599};
const HOURLY_PACKAGES={RESIDENTIAL:[{hours:1,price:399},{hours:2,price:749},{hours:3,price:1049},{hours:4,price:1299},{hours:6,price:1849},{hours:8,price:2399}],COMMERCIAL:[{hours:1,price:499},{hours:2,price:949},{hours:3,price:1399},{hours:4,price:1799},{hours:6,price:2599},{hours:8,price:3399}],SPECIALIST:[{hours:1,price:599},{hours:2,price:1149},{hours:3,price:1699},{hours:4,price:2199},{hours:6,price:3199},{hours:8,price:4199}]};

function normaliseKey(value,fallback='OTHER'){return String(value||fallback).toUpperCase().replace(/[^A-Z0-9]+/g,'_');}
function employeeTier(value){const n=Math.max(1,Number(value)||1);return EMPLOYEE_TIERS.find(t=>n>=t.min&&n<=t.max)||{min:1001,max:Number.MAX_SAFE_INTEGER,workers:Math.ceil(n/110)};}
function round(n){return Math.round(n/100)*100;}
function safeFactor(map,key){return map[normaliseKey(key)]||1;}

export const HOURLY_RATES={RESIDENTIAL:349,OFFICE:449,COMMERCIAL:499,SPECIALIST:599};

export function calculateHourlyQuote({hours=1,segment='RESIDENTIAL',serviceType='REGULAR',workers=1,city='OTHER'}){
  const h=Math.max(1,Number(hours)||1), w=Math.max(1,Number(workers)||1);
  const seg=normaliseKey(segment,'RESIDENTIAL');
  const specialist=['SPECIALIST','HOSPITAL'].includes(seg)||['SANITISATION','POST_CONSTRUCTION'].includes(normaliseKey(serviceType));
  const rate=specialist?HOURLY_RATES.SPECIALIST:(seg==='RESIDENTIAL'?HOURLY_RATES.RESIDENTIAL:seg==='OFFICE'?HOURLY_RATES.OFFICE:HOURLY_RATES.COMMERCIAL);
  const packageKey=specialist?'SPECIALIST':seg==='RESIDENTIAL'?'RESIDENTIAL':'COMMERCIAL';
  const pkg=HOURLY_PACKAGES[packageKey]?.find(p=>p.hours===h);
  const base=pkg?pkg.price:h*rate;
  const total=base*w*safeFactor(CITY_FACTORS,city);
  return {pricingModel:'HOURLY',segment:seg,serviceType:normaliseKey(serviceType),hours:h,workers:w,hourlyRate:rate,charge:round(total),currency:'INR',customerNote:'Includes the selected service duration and standard service allocation. Specialist materials/equipment are quoted separately where required.'};
}

export function calculateQuote({employees=1,employeeCount=employees,facilityType='OFFICE',sector=facilityType,serviceType='REGULAR',serviceName, billingTerm='MONTHLY',frequency='DAILY',areaSqFt=0,city='OTHER',locationTier='METRO_OUTER',washrooms=0,floors=1,serviceHours=8,complexity='STANDARD'}){
  const people=Math.max(1,Number(employeeCount)||1);
  const sectorKey=normaliseKey(sector||facilityType);
  const serviceKey=normaliseKey(serviceType||serviceName);
  const tier=employeeTier(people);
  const workers=tier.workers;
  const area=Number(areaSqFt)||0;
  const areaFactor=area>0?(area>25000?1.20:area>10000?1.10:area>5000?1.05:1):1;
  const complexityFactor={STANDARD:1,PREMIUM:1.15,HIGH_RISK:1.30}[normaliseKey(complexity)]||1;
  const frequencyFactor={DAILY:1,FIVE_DAYS_WEEK:0.92,THREE_DAYS_WEEK:0.70,TWICE_WEEK:0.55,WEEKLY:0.34}[normaliseKey(frequency)]||1;
  const shiftFactor=Number(serviceHours)>=12?1.35:Number(serviceHours)>=8?1:Number(serviceHours)>=4?.62:.40;
  const salaryCost=workers*CONFIG.TARGET_SALARY/CONFIG.UTILISATION;
  const operating=workers*(CONFIG.TARGET_SALARY*CONFIG.EMPLOYER_OVERHEAD+CONFIG.TRAVEL_PER_WORKER+CONFIG.CONSUMABLES_PER_WORKER+CONFIG.SUPERVISION_PER_WORKER+CONFIG.EQUIPMENT_PER_WORKER)+CONFIG.PLATFORM_PER_JOB;
  const baseCost=salaryCost+operating;
  const monthlyCost=baseCost*safeFactor(CITY_FACTORS,city)*safeFactor(AREA_FACTORS,locationTier)*safeFactor(SECTOR_FACTORS,sectorKey)*safeFactor(SERVICE_FACTORS,serviceKey)*areaFactor*complexityFactor*shiftFactor*frequencyFactor;
  const monthlyPrice=round(monthlyCost/(1-CONFIG.TARGET_MARGIN));
  const term=normaliseKey(billingTerm)==='YEARLY'?'YEARLY':'MONTHLY';
  const annualCharge=round(monthlyPrice*12*(1-CONFIG.ANNUAL_DISCOUNT));
  const monthlyEquivalent=term==='YEARLY'?round(annualCharge/12):monthlyPrice;
  const reason=workers===1?'One professional provides the planned routine coverage within the selected service window.':`${workers} professionals are recommended to cover the facility size, people served and selected service window without compressing hygiene tasks.`;
  return {pricingModel:'COST_PLUS_MARGIN',employees:people,employeeTier:`${tier.min}-${tier.max===Number.MAX_SAFE_INTEGER?'∞':tier.max}`,facilityType:sectorKey,serviceType:serviceKey,billingTerm:term,frequency,areaSqFt:area,city:normaliseKey(city),locationTier:normaliseKey(locationTier),recommendedWorkers:workers,workerReason:reason,serviceHours:Number(serviceHours)||8,monthlyCharge:monthlyEquivalent,annualCharge:annualCharge,annualSavings:round(monthlyPrice*12-annualCharge),recommendedPrice:monthlyEquivalent,costProtection:{targetWorkerSalary:CONFIG.TARGET_SALARY,targetMargin:CONFIG.TARGET_MARGIN,utilisation:CONFIG.UTILISATION},currency:'INR',included:['Workforce allocation','Standard cleaning equipment','Routine consumables allocation','Operational coordination','Quality checks'],customerNote:'Final scope is confirmed before service where actual site conditions materially differ from the information supplied.'};
}
