import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduleOverlaps, workerCanServeFacility, chooseAvailableWorker } from '../src/lib/scheduling.js';

test('schedule overlap detects partial and contained conflicts but allows adjacent shifts', () => {
  assert.equal(scheduleOverlaps('2026-10-10T10:00:00Z','2026-10-10T12:00:00Z','2026-10-10T11:00:00Z','2026-10-10T13:00:00Z'), true);
  assert.equal(scheduleOverlaps('2026-10-10T10:00:00Z','2026-10-10T12:00:00Z','2026-10-10T10:15:00Z','2026-10-10T11:00:00Z'), true);
  assert.equal(scheduleOverlaps('2026-10-10T10:00:00Z','2026-10-10T12:00:00Z','2026-10-10T12:00:00Z','2026-10-10T14:00:00Z'), false);
});

test('invalid or reversed intervals never count as conflicts', () => {
  assert.equal(scheduleOverlaps('bad','2026-10-10T12:00:00Z','2026-10-10T11:00:00Z','2026-10-10T13:00:00Z'), false);
  assert.equal(scheduleOverlaps('2026-10-10T12:00:00Z','2026-10-10T10:00:00Z','2026-10-10T11:00:00Z','2026-10-10T13:00:00Z'), false);
});

test('hospital and factory work excludes general cleaners', () => {
  assert.equal(workerCanServeFacility({status:'ACTIVE',classification:'L1_GENERAL',user:{active:true}},'HOSPITAL'), false);
  assert.equal(workerCanServeFacility({status:'VERIFIED',classification:'L2_CERTIFIED',user:{active:true}},'HOSPITAL'), true);
});

test('auto assignment skips conflicts and chooses the highest-rated eligible worker', () => {
  const workers = [
    {id:'conflict',status:'ACTIVE',classification:'L2_CERTIFIED',rating:5,user:{active:true}},
    {id:'best',status:'ACTIVE',classification:'L2_CERTIFIED',rating:4.9,user:{active:true}},
    {id:'inactive',status:'ACTIVE',classification:'L2_CERTIFIED',rating:5,user:{active:false}}
  ];
  assert.equal(chooseAvailableWorker(workers,'OFFICE',['conflict'])?.id, 'best');
});

test('auto assignment returns null if no eligible available worker exists', () => {
  assert.equal(chooseAvailableWorker([{id:'one',status:'PENDING',classification:'L1_GENERAL'}],'OFFICE') , null);
});
