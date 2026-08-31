'use client';
import {useEffect,useMemo,useState} from 'react';

const TEAM_ROLES=['PLATFORM_ADMIN','OPERATIONS_MANAGER','SUPERVISOR','PROFESSIONAL'];
const configs={
 sales:['Sales & Leads','Turn inbound cleaning requirements into assessed, quoted and contracted business.',['Lead intake','Site assessments','Quote pipeline','Follow-ups']],
 customers:['Customers','Manage business accounts and service relationships.',['Organizations','Contacts','Facilities','Service history']],
 facilities:['Facilities','Maintain every customer site, scope, risk profile and operating window.',['Sites','Site details','SOPs','Risk controls']],
 assessments:['Assessments','Capture site requirements and turn them into an operational scope.',['Area & floors','Service mix','Manpower','Equipment & consumables']],
 quotes:['Quotes','Prepare commercial proposals using the assessed scope and pricing rules.',['Monthly value','Setup fee','Staffing','SLA']],
 contracts:['Contracts','Manage active recurring service agreements and SLAs.',['Contract terms','Service frequency','Start/end','SLA']],
 schedule:['Schedule','Plan recurring and one-off services with workforce coverage.',['Calendar','Recurring jobs','Coverage','Exceptions']],
 jobs:['Jobs','Run daily service delivery from assignment through completion.',['Assignment','Check-in','Tasks','Check-out','Evidence']],
 workforce:['Workforce','Manage professionals, verification, assignments and attendance.',['Roster','Availability','Attendance','Performance']],
 quality:['Quality & Rework','Inspect completed services, resolve failures and approve rework.',['Inspection','Pass / fail','Rework','Re-inspection','Approval']],
 invoices:['Invoices','Turn approved services into persistent customer invoices.',['Draft','Issued','Sent','Overdue']],
 payments:['Payments','Track receipts, balances and collection state.',['Pending','Successful','Partial','Paid']],
 reports:['Reports','Management view across service delivery, quality and revenue.',['Operations','Quality','Workforce','Revenue']]
};
const endpointMap={requests:'/api/requests',sales:'/api/requests',quotes:'/api/quotes',jobs:'/api/jobs',quality:'/api/qa/inspection',workforce:'/api/workforce/recommend',invoices:'/api/invoices',payments:'/api/payments'};
const actionMap={
 sales:[['Review new service requests','/ops/sales','requests'],['Schedule site assessments','/ops/assessments','navigate'],['Prepare commercial proposals','/ops/quotes','navigate']],
 customers:[['Review active accounts','/ops/customers','navigate'],['Open customer facilities','/ops/facilities','navigate'],['Review service history','/ops/jobs','navigate']],
 facilities:[['Add a facility','/ops/facilities','navigate'],['Review site requirements','/ops/assessments','navigate'],['Check facility risk profiles','/ops/facilities','navigate']],
 assessments:[['Open assessment queue','/ops/assessments','navigate'],['Record site measurements','/ops/assessments','assessment'],['Prepare quote inputs','/ops/quotes','navigate']],
 quotes:[['Review quote pipeline','/ops/quotes','navigate'],['Calculate service pricing','/ops/quotes','navigate'],['Send proposal','/ops/quotes','navigate']],
 contracts:[['Review active contracts','/ops/contracts','navigate'],['Check SLA terms','/ops/contracts','navigate'],['Plan renewals','/ops/contracts','navigate']],
 schedule:[['View today’s coverage','/ops/jobs','navigate'],['Create recurring service','/ops/schedule','navigate'],['Resolve staffing gaps','/ops/workforce','navigate']],
 jobs:[['View today’s jobs','/ops/jobs','navigate'],['Assign professional','/ops/workforce','navigate'],['Monitor check-in/out','/ops/jobs','navigate']],
 workforce:[['Review roster','/ops/workforce','navigate'],['Check attendance','/ops/workforce','navigate'],['Find replacement','/ops/workforce','navigate']],
 quality:[['Review failed inspections','/ops/quality','quality'],['Create corrective action','/ops/quality','navigate'],['Re-inspect completed rework','/ops/quality','navigate']],
 invoices:[['Review issued invoices','/ops/invoices','navigate'],['Create invoice from approved job','/ops/invoices','navigate'],['Review overdue balances','/ops/payments','navigate']],
 payments:[['Record payment','/ops/payments','payment'],['Review outstanding','/ops/payments','navigate'],['Reconcile receipts','/ops/payments','navigate']],
 reports:[['Review revenue','/ops/reports','navigate'],['Review quality','/ops/quality','navigate'],['Review workforce','/ops/workforce','navigate']]
};

export default function Module({params}){
 const [module,setModule]=useState(''); const [user,setUser]=useState(null); const [data,setData]=useState([]); const [message,setMessage]=useState(''); const [loading,setLoading]=useState(true); const [form,setForm]=useState({facilityName:'',serviceName:'Recurring Cleaning',requestId:'',amount:'',contractId:'',facilityId:'',scheduledFor:'',jobId:'',result:'PASS',score:'',notes:'',paymentAmount:''});
 useEffect(()=>{Promise.resolve(params).then(p=>setModule(p.module));fetch('/api/me').then(r=>r.json()).then(m=>{if(!m.authenticated||!TEAM_ROLES.includes(m.user.role)){location.href='/team-login';return}setUser(m.user)}).catch(()=>setMessage('Unable to verify team session.'));},[params]);
 useEffect(()=>{if(!module)return;const url=endpointMap[module];if(!url){setLoading(false);return}fetch(url).then(r=>r.json()).then(x=>{setData(Array.isArray(x.data)?x.data:[]);setLoading(false)}).catch(()=>{setLoading(false);setMessage('Workspace data could not be loaded.');});},[module]);
 const c=configs[module]||['CleanOps Module','Operational workspace for your cleaning business.',['Customers','Operations','Quality','Finance']];
 const actions=actionMap[module]||[['Review operations',`/ops/${module}`,'navigate'],['Open current work',`/ops/${module}`,'navigate'],['Resolve exceptions',`/ops/${module}`,'navigate']];
 function go(path){location.href=path}
 async function run(type){setMessage('Working…');let url=endpointMap[module];let body={};
   if(type==='requests'){body={facilityName:form.facilityName,serviceName:form.serviceName};}
   if(type==='quotes'){body={requestId:form.requestId,amount:Number(form.amount),frequency:'MONTHLY'};}
   if(type==='jobs'){body={contractId:form.contractId,facilityId:form.facilityId,scheduledFor:form.scheduledFor};}
   if(type==='quality'){body={jobId:form.jobId,result:form.result,score:form.score?Number(form.score):null,notes:form.notes};}
   if(type==='payment'){url='/api/payments';body={invoiceId:form.requestId,amount:Number(form.paymentAmount)};}
   if(type==='assessment'){url='/api/assessments';body={areaSqFt:Number(form.amount),facilityType:'OFFICE'};}
   try{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const x=await r.json();if(!r.ok)throw new Error(x.error||'Action failed');setMessage(`Completed successfully: ${x.data?.id||'record saved'}`);if(endpointMap[module]){const refreshed=await fetch(endpointMap[module]).then(v=>v.json()).catch(()=>({}));setData(Array.isArray(refreshed.data)?refreshed.data:[])} }catch(e){setMessage(e.message||'Unable to complete action.')}}
 return <main style={{minHeight:'100vh',background:'#f6f8f8',fontFamily:'Inter,system-ui',color:'#102a2a'}}>
 <aside style={side}><a href="/ops" style={brand}>CleanOps Pro</a><div style={sub}>INTERNAL CONTROL CENTER</div>{[['Overview','/ops'],...Object.entries(configs).map(([k,v])=>[v[0],`/ops/${k}`])].map(([label,href])=><a key={href} href={href} style={link}>{label}</a>)}<a href="/api/auth/logout" style={{...link,color:'#f2b8b5',marginTop:18}}>Sign out</a></aside>
 <section style={{marginLeft:250,padding:32,maxWidth:1400}}><a href="/ops" style={{color:'#0d6b61',textDecoration:'none'}}>← Operations overview</a><div style={{marginTop:24,display:'flex',justifyContent:'space-between',gap:20,alignItems:'start'}}><div><div style={eyebrow}>CLEANOPS WORKSPACE</div><h1 style={{fontSize:38,margin:'5px 0'}}>{c[0]}</h1><p style={{color:'#64748b',maxWidth:720}}>{c[1]}</p></div><span style={pill}>{user?.role?.replaceAll('_',' ')}</span></div>
 {message&&<div style={notice}>{message}</div>}
 <section style={grid}>{c[2].map(x=><article key={x} style={card}><div style={icon}>✓</div><h3>{x}</h3><p style={{color:'#64748b',fontSize:14,lineHeight:1.5}}>Live workflow area with persistent actions, validation and audit-ready state changes.</p></article>)}</section>
 <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>Next actions</h2>{actions.map(([a,path,type])=><button key={a} onClick={()=>type==='navigate'?go(path):setMessage('Use the action form below to complete this workflow.')} style={action}>{a}<span>→</span></button>)}</section>
 {module==='sales'&&<ActionForm title="Create service request" fields={[['facilityName','Facility name'],['serviceName','Service name']]} form={form} setForm={setForm} submit={()=>run('requests')} button="Create request"/>}
 {module==='assessments'&&<ActionForm title="Run site assessment" fields={[['amount','Area (sq ft)']]} form={form} setForm={setForm} submit={()=>run('assessment')} button="Calculate assessment"/>}
 {module==='quotes'&&<ActionForm title="Create commercial proposal" fields={[['requestId','Request ID'],['amount','Monthly amount']]} form={form} setForm={setForm} submit={()=>run('quotes')} button="Create quote"/>}
 {module==='jobs'&&<ActionForm title="Create scheduled job" fields={[['contractId','Contract ID'],['facilityId','Facility ID'],['scheduledFor','Scheduled date/time']]} form={form} setForm={setForm} submit={()=>run('jobs')} button="Create job"/>}
 {module==='quality'&&<ActionForm title="Record inspection" fields={[['jobId','Job ID'],['score','Score']]} form={form} setForm={setForm} submit={()=>run('quality')} button="Save inspection" select={[['result',['PASS','FAIL']]]} />}
 {module==='payments'&&<ActionForm title="Record payment" fields={[['requestId','Invoice ID'],['paymentAmount','Payment amount']]} form={form} setForm={setForm} submit={()=>run('payment')} button="Record payment"/>}
 {module==='quality'&&<section style={{...card,marginTop:18}}><h2>Quality control chain</h2><div style={flow}><b>Service complete</b><span>→</span><b>Inspection</b><span>→</span><b>PASS / FAIL</b><span>→</span><b>Rework</b><span>→</span><b>Re-inspection</b><span>→</span><b>Approved</b></div></section>}
 <section style={{...card,marginTop:18}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2 style={{margin:0}}>Live records</h2><span style={{color:'#64748b',fontSize:13}}>{loading?'Loading…':`${data.length} records`}</span></div>{data.length?data.slice(0,12).map((r,i)=><div key={r.id||i} style={record}><b>{r.id||r.name||`Record ${i+1}`}</b><span>{r.status||r.result||r.amount||r.serviceName||'Active'}</span></div>):<p style={{color:'#64748b'}}>No records returned yet. Create the first record using the action above.</p>}</section>
 </section></main>}
function ActionForm({title,fields,form,setForm,submit,button,select=[]}){return <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>{title}</h2><div style={formgrid}>{fields.map(([key,label])=><label key={key} style={{fontSize:13,fontWeight:700}}>{label}<input value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={input} placeholder={label}/></label>)}{select.map(([key,opts])=><label key={key} style={{fontSize:13,fontWeight:700}}>Result<select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={input}>{opts.map(o=><option key={o}>{o}</option>)}</select></label>)}</div><button onClick={submit} style={primary}>{button}</button></section>}
const side={position:'fixed',inset:'0 auto 0 0',width:250,background:'#092521',padding:22,boxSizing:'border-box',overflowY:'auto'};const brand={color:'#fff',fontSize:22,fontWeight:900,textDecoration:'none'};const sub={color:'#8fbab3',fontSize:11,fontWeight:800,letterSpacing:1,margin:'8px 0 22px'};const link={display:'block',padding:'9px 10px',borderRadius:8,color:'#d9e9e6',textDecoration:'none',fontSize:13,margin:'2px 0'};const eyebrow={fontSize:12,fontWeight:800,letterSpacing:1.5,color:'#0d6b61'};const pill={background:'#e5f2ef',color:'#0d6b61',padding:'9px 12px',borderRadius:999,fontSize:12,fontWeight:800};const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:25};const card={background:'#fff',border:'1px solid #e1e9e7',borderRadius:16,padding:20};const icon={width:30,height:30,borderRadius:9,background:'#e7f3f0',color:'#0d6b61',display:'grid',placeItems:'center',fontWeight:800};const action={width:'100%',display:'flex',justifyContent:'space-between',padding:14,background:'#fff',border:0,borderTop:'1px solid #edf1f0',textAlign:'left',fontSize:15,cursor:'pointer'};const notice={marginTop:18,padding:12,background:'#ecfdf3',border:'1px solid #b7ebcd',borderRadius:10,color:'#146c43'};const flow={display:'flex',flexWrap:'wrap',gap:10,alignItems:'center',color:'#0d6b61'};const formgrid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12};const input={display:'block',width:'100%',boxSizing:'border-box',marginTop:6,padding:11,border:'1px solid #cbd5e1',borderRadius:9};const primary={marginTop:14,padding:'11px 16px',border:0,borderRadius:9,background:'#0d6b61',color:'#fff',fontWeight:800,cursor:'pointer'};const record={display:'flex',justifyContent:'space-between',gap:12,padding:'13px 0',borderBottom:'1px solid #edf1f0'};
