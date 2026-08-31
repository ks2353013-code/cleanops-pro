const serviceRules={
 HOSPITAL:{baseHoursPer1000SqFt:0.75,minWorkers:2,supervisionPct:.12},
 SCHOOL:{baseHoursPer1000SqFt:0.5,minWorkers:1,supervisionPct:.08},
 OFFICE:{baseHoursPer1000SqFt:0.35,minWorkers:1,supervisionPct:.06},
 HOTEL:{baseHoursPer1000SqFt:0.65,minWorkers:2,supervisionPct:.1},
 FACTORY:{baseHoursPer1000SqFt:0.6,minWorkers:2,supervisionPct:.1},
 WAREHOUSE:{baseHoursPer1000SqFt:0.3,minWorkers:1,supervisionPct:.06},
 RETAIL:{baseHoursPer1000SqFt:0.4,minWorkers:1,supervisionPct:.06},
 GYM:{baseHoursPer1000SqFt:0.45,minWorkers:1,supervisionPct:.07}
};
export function assessSite({facilityType='OFFICE',areaSqFt=0,frequency='WEEKLY',riskProfile='standard',service='Recurring Cleaning'}){
 const type=String(facilityType).toUpperCase(); const rule=serviceRules[type]||serviceRules.OFFICE; const area=Math.max(0,Number(areaSqFt)); const risk=riskProfile==='critical'?1.35:riskProfile==='high'?1.18:1; const freq=String(frequency).toUpperCase(); const frequencyFactor={DAILY:1,WEEKLY:1.08,BIWEEKLY:1.18,MONTHLY:1.3,ONE_TIME:1.25}[freq]||1.1; const hours=Math.max(1,(area/1000)*rule.baseHoursPer1000SqFt*risk*frequencyFactor); const workers=Math.max(rule.minWorkers,Math.ceil(hours/8)); return {facilityType:type,service,areaSqFt:area,riskProfile,estimatedHoursPerVisit:Number(hours.toFixed(2)),recommendedWorkers:workers,supervisionPct:rule.supervisionPct,assessmentVersion:'1.0'};
}
