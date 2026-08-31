export const PERMISSIONS={
 PLATFORM_ADMIN:['*'],
 OPERATIONS_MANAGER:['organization:read','facility:read','facility:write','request:read','request:write','quote:read','quote:write','contract:read','contract:write','job:read','job:write','worker:read','worker:write','quality:read','billing:read','audit:read'],
 SUPERVISOR:['facility:read','job:read','job:write','worker:read','quality:read','quality:write'],
 CLIENT_MANAGER:['organization:read','facility:read','facility:write','request:read','request:write','quote:read','quote:approve','contract:read','contract:approve','job:read','quality:read','complaint:write','billing:read'],
 PROFESSIONAL:['facility:read','job:read','job:checkin','job:checkout','checklist:read','checklist:write']
};
export function can(role,permission){const p=PERMISSIONS[role]||[];return p.includes('*')||p.includes(permission);}
export function requirePermission(user,permission){if(!user||!can(user.role,permission))throw new Error('FORBIDDEN');return user;}
