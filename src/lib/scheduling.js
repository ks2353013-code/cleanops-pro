const RESTRICTED_TYPES = new Set(['HOSPITAL', 'FACTORY']);
const CLASS_LEVEL = { L1_GENERAL: 1, L2_CERTIFIED: 2, L3_SPECIALIZED: 3, L4_SENIOR: 4, L5_SUPERVISOR: 5 };

export function scheduleOverlaps(start, end, otherStart, otherEnd) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  const c = new Date(otherStart).getTime();
  const d = new Date(otherEnd).getTime();
  if (![a, b, c, d].every(Number.isFinite) || b <= a || d <= c) return false;
  return a < d && c < b;
}

export function workerCanServeFacility(worker, facilityType) {
  if (!worker || !['ACTIVE', 'VERIFIED'].includes(String(worker.status).toUpperCase()) || worker.user?.active === false) return false;
  const classification = String(worker.classification || '').toUpperCase();
  if (!(classification in CLASS_LEVEL)) return false;
  if (RESTRICTED_TYPES.has(String(facilityType).toUpperCase()) && CLASS_LEVEL[classification] < 2) return false;
  return true;
}

export function chooseAvailableWorker(workers, facilityType, conflictingWorkerIds = []) {
  const conflicts = new Set(conflictingWorkerIds);
  return [...workers]
    .filter(worker => workerCanServeFacility(worker, facilityType) && !conflicts.has(worker.id))
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || String(a.id).localeCompare(String(b.id)))[0] || null;
}
