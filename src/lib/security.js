import crypto from 'node:crypto';
export function safeEqual(a,b){const aa=Buffer.from(String(a));const bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
export function sanitizeText(value,max=500){return String(value??'').replace(/[<>]/g,'').trim().slice(0,max);}
export function validatePagination({page=1,pageSize=25,maxPageSize=100}={}){const p=Math.max(1,Number(page)||1);const size=Math.min(maxPageSize,Math.max(1,Number(pageSize)||25));return {page:p,pageSize:size,skip:(p-1)*size};}
export function assertAllowedUpload({mime,size,maxBytes=10*1024*1024,allowed=['image/jpeg','image/png','application/pdf']}){if(!allowed.includes(mime))throw new Error('UNSUPPORTED_FILE_TYPE');if(Number(size)>maxBytes)throw new Error('FILE_TOO_LARGE');return true;}
