import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote } from '../src/lib/pricing.js';
import { assessSite } from '../src/lib/assessment.js';
import { workerEligible } from '../src/lib/workforce.js';
import { canTransition, transitionJob } from '../src/lib/work-order.js';
import { evaluateService } from '../src/lib/quality.js';
import { buildInvoice, agingBucket } from '../src/lib/billing.js';

test('site assessment scales hours and workers for hospital risk',()=>{const r=assessSite({facilityType:'HOSPITAL',areaSqFt:10000,frequency:'WEEKLY',riskProfile:'high'});assert.ok(r.estimatedHoursPerVisit>7);assert.ok(r.recommendedWorkers>=2);});
test('quote calculator returns positive commercial price',()=>{const r=calculateQuote({areaSqFt:10000,facilityType:'OFFICE',frequency:'WEEKLY',workers:2,laborRate:250,consumables:1000,margin:.2});assert.ok(r.recommendedPrice>r.directCost);});
test('hospital excludes general worker classification',()=>{assert.equal(workerEligible({facilityType:'HOSPITAL',classification:'L1_GENERAL',active:true,available:true}),false);assert.equal(workerEligible({facilityType:'HOSPITAL',classification:'L2_CERTIFIED',active:true,available:true}),true);});
test('job lifecycle rejects invalid transition',()=>{assert.equal(canTransition('draft','completed'),false);assert.throws(()=>transitionJob({id:'J1',status:'draft'},'completed','admin'),/INVALID_TRANSITION/);});
test('quality requires corrective action below acceptance',()=>{const r=evaluateService({checklist:[{status:'completed'},{status:'pending'}],inspectionScore:70,customerRating:3,slaMet:true});assert.equal(r.status,'corrective_action_required');});
test('invoice totals and aging are deterministic',()=>{const i=buildInvoice({contractId:'C1',customerId:'U1',periodStart:'2026-08-01',periodEnd:'2026-08-31',lines:[{description:'Cleaning',quantity:4,unitPrice:1000}],taxRate:18});assert.equal(i.subtotal,4000);assert.equal(i.total,4720);assert.equal(agingBucket({dueDate:'2026-07-01',asOf:'2026-08-29'}),'31-60');});
