export const ROLES = ['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR','CLIENT_MANAGER','PROFESSIONAL'];
export const WORKER_LEVELS = ['L1_GENERAL','L2_CERTIFIED','L3_SPECIALIZED','L4_SENIOR','L5_SUPERVISOR'];
export const FACILITY_TYPES = ['SCHOOL','HOSPITAL','OFFICE','HOTEL','FACTORY','WAREHOUSE','RETAIL','RESIDENTIAL','GYM'];
export const REQUEST_STATUSES = ['NEW','ASSESSMENT','QUOTED','APPROVED','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'];

export function assertRole(role, allowed) {
  if (!allowed.includes(role)) throw new Error('FORBIDDEN');
}
export function normalizeServiceRequest(input) {
  return {
    client: String(input.client || '').trim(),
    facilityType: String(input.facilityType || 'OFFICE').toUpperCase(),
    service: String(input.service || '').trim(),
    frequency: String(input.frequency || 'ONE_TIME').toUpperCase(),
    notes: String(input.notes || '').trim()
  };
}
