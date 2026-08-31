'use client';
import { useMemo, useState } from 'react';

const IMAGE = {
  team: 'https://storage.googleapis.com/content-assistant-images-persistent/professional-janitorial-team-cleaning-a-commercial-space-with-modern-equipment-64506496-9b67-4ae4-9e70-e06feb734bfe.webp',
  office: 'https://lirp.cdn-website.com/4f9170c1/dms3rep/multi/opt/impresa_di_pulizie_all_service%2B%287%29-640w.png',
  hospital: 'https://irp.cdn-website.com/md/dmaiip/c1e1b746-e7ba-4d54-850b-63f4ceeda9aa.jpg',
  school: 'https://venky.com.au/assets/img/9-Schools-Cleaning.jpg'
};

const SERVICES = [
  { id:'home', icon:'🏠', name:'Home Cleaning', group:'Personal', desc:'Everyday cleaning for homes and apartments.', price:999, unit:'visit', image:IMAGE.team, includes:['Dusting','Floors','Kitchen exterior','Bathrooms'], excludes:['Pest control','Heavy restoration'] },
  { id:'deep', icon:'✨', name:'Deep Cleaning', group:'Personal', desc:'Top-to-bottom detailed cleaning.', price:1499, unit:'service', image:IMAGE.team, includes:['Detailed dusting','Kitchen deep clean','Bathroom deep clean','Floors'], excludes:['Pest control','Biohazard work'] },
  { id:'sofa', icon:'🛋️', name:'Sofa & Carpet Cleaning', group:'Personal', desc:'Professional upholstery and carpet care.', price:799, unit:'service', image:IMAGE.team, includes:['Vacuuming','Spot treatment','Machine cleaning'], excludes:['Repair/restoration','Severe mould'] },
  { id:'office', icon:'🏢', name:'Office Cleaning', group:'Business', desc:'Recurring workplace cleaning.', price:6500, monthly:true, image:IMAGE.office, includes:['Work areas','Washrooms','Pantry','Waste handling','Quality checks'], excludes:['Pest control','Hazardous waste'] },
  { id:'school', icon:'🏫', name:'School Cleaning', group:'Business', desc:'Cleaning and hygiene for schools.', price:7500, monthly:true, image:IMAGE.school, includes:['Classrooms','Washrooms','Common areas','High-touch sanitisation'], excludes:['Medical waste','Major repairs'] },
  { id:'hospital', icon:'🏥', name:'Hospital Cleaning', group:'Business', desc:'Professional hygiene and sanitation.', price:9500, monthly:true, image:IMAGE.hospital, includes:['Clinical/non-clinical cleaning','Washrooms','Disinfection','Cleaning logs'], excludes:['Biomedical waste disposal','Medical sterilisation'] },
  { id:'hotel', icon:'🏨', name:'Hotel Cleaning', group:'Business', desc:'Guest-ready rooms and facilities.', price:9000, monthly:true, image:IMAGE.team, includes:['Guest rooms','Lobby','Corridors','Washrooms'], excludes:['Laundry unless contracted','Pest control'] },
  { id:'factory', icon:'🏭', name:'Factory Cleaning', group:'Business', desc:'Industrial facility cleaning.', price:10500, monthly:true, image:IMAGE.team, includes:['Production housekeeping','Floors','Common areas','Washrooms'], excludes:['Chemical spills','Hazardous waste'] },
  { id:'warehouse', icon:'📦', name:'Warehouse Cleaning', group:'Business', desc:'Cleaning for logistics spaces.', price:8000, monthly:true, image:IMAGE.team, includes:['Floors','Dust removal','Common areas','Washrooms'], excludes:['High-level racks','Pest control'] },
  { id:'retail', icon:'🏪', name:'Retail Cleaning', group:'Business', desc:'Keep stores customer-ready.', price:7000, monthly:true, image:IMAGE.office, includes:['Sales floor','Entrance','Displays','Washrooms'], excludes:['Merchandising','Pest control'] },
  { id:'glass', icon:'🪟', name:'Glass & Window Cleaning', group:'All', desc:'Professional glass cleaning.', price:999, unit:'service', image:IMAGE.office, includes:['Internal glass','Accessible external glass','Frames'], excludes:['Rope access','Crane/lift hire'] },
  { id:'floor', icon:'🧽', name:'Floor & Carpet Care', group:'All', desc:'Floor treatment and carpet care.', price:1299, unit:'service', image:IMAGE.office, includes:['Vacuuming','Machine cleaning','Spot treatment'], excludes:['Replacement','Major restoration'] },
  { id:'sanitation', icon:'🧼', name:'Sanitisation & Hygiene', group:'All', desc:'Focused disinfection and hygiene.', price:1499, unit:'service', image:IMAGE.hospital, includes:['High-touch disinfection','Washrooms','Common areas'], excludes:['Medical sterilisation','Biohazard remediation'] },
  { id:'construction', icon:'🏗️', name:'Post-Construction Cleaning', group:'Business', desc:'Handover-ready cleaning.', price:6999, unit:'service', image:IMAGE.team, includes:['Construction dust','Floors','Surfaces','Final presentation clean'], excludes:['Hazardous material removal','Structural repairs'] },
  { id:'move', icon:'🚚', name:'Move-in / Move-out Cleaning', group:'All', desc:'A fresh clean before or after moving.', price:1799, unit:'service', image:IMAGE.team, includes:['Floors','Kitchen','Bathrooms','Dusting'], excludes:['Furniture removal','Pest control'] }
];

const TERMS = [
  'Prices shown are estimates/starting prices unless marked fixed.',
  'GST and applicable taxes are additional unless stated otherwise.',
  'Customer must provide accurate premises, occupancy and access information.',
  'Material changes in scope or site condition may require repricing.',
  'Hazardous, biomedical, chemical and specialist work is excluded unless expressly contracted.',
  'Recurring services follow the agreed frequency, staffing and service-level plan.',
  'Cancellation/rescheduling is subject to applicable booking terms and workforce availability.',
  'The final signed service agreement prevails over general catalogue wording.'
];

const money = (n) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
function businessPrice(service, people, term) {
  const n=Math.max(1,Number(people)||1);
  const tiers=[[1,25,1],[26,50,1.45],[51,100,2.1],[101,200,3.1],[201,350,4.5],[351,500,6],[501,750,8],[751,1000,10]];
  const tier=tiers.find((x)=>n>=x[0]&&n<=x[1]);
  const factor=tier?tier[2]:Math.ceil(n/100)*1.2;
  const monthly=service.price*factor;
  return term==='YEARLY'?monthly*12*0.92:monthly;
}

export default function ClientPortal(){
  const [filter,setFilter]=useState('All');
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);
  const [people,setPeople]=useState(50);
  const [term,setTerm]=useState('MONTHLY');
  const [name,setName]=useState('');
  const [address,setAddress]=useState('');
  const [date,setDate]=useState('');
  const [frequency,setFrequency]=useState('Daily');
  const [notes,setNotes]=useState('');
  const [busy,setBusy]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');

  const visible=useMemo(()=>SERVICES.filter((s)=>(filter==='All'||s.group===filter||s.group==='All')&&s.name.toLowerCase().includes(search.toLowerCase())),[filter,search]);
  const price=selected?(selected.monthly?Math.round(businessPrice(selected,people,term)):selected.price):0;
  const open=(service)=>{setSelected(service);setSent(false);setError('');setPeople(50);setTerm('MONTHLY');setFrequency(service.monthly?'Daily':'One-time');};

  async function book(){
    if(!name||!address||!date){setError('Please add your name/facility, location and preferred date.');return;}
    setBusy(true);
    try{
      const r=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({serviceName:selected.name,customerType:selected.monthly?'BUSINESS':'INDIVIDUAL',facilityName:name,address,preferredDate:date,frequency,requirements:notes,employeeCount:selected.monthly?people:null,billingTerm:selected.monthly?term:null,estimatedPrice:price,currency:'INR'})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||'Unable to create request');
      setSent(true);
    }catch(e){setError(e.message);}finally{setBusy(false);}
  }

  return <main style={styles.shell}>
    <header style={styles.header}><a href="/" style={styles.brand}>CleanOps <span>Pro</span></a><nav><a href="/client/financials" style={styles.nav}>Payments</a><a href="/client/facilities" style={styles.nav}>My places</a><a href="/api/auth/logout" style={styles.nav}>Sign out</a></nav></header>
    <section style={styles.hero}><div style={styles.heroCopy}><div style={styles.eye}>CLEANOPS SERVICES</div><h1 style={styles.heroTitle}>Professional cleaning, <em>made simple.</em></h1><p style={styles.heroText}>Choose a service, see your estimated ₹ price, understand exactly what is included, and book.</p><div style={styles.heroTrust}>✓ Verified professionals &nbsp; ✓ Clear service scope &nbsp; ✓ Monthly & annual plans</div></div><div style={styles.heroImage}><img src={IMAGE.team} alt="Professional commercial cleaning team" style={styles.heroImageImg}/><div style={styles.imageBadge}>Clean spaces. Better places.</div></div></section>
    <section style={styles.quote}><div style={styles.quoteMark}>“</div><blockquote style={styles.quoteBlockquote}>Clean spaces are not a luxury. They are part of how a great home, workplace and institution should feel.</blockquote><span>— CleanOps service promise</span></section>
    <section style={styles.content}><div style={styles.heading}><div><div style={styles.eye}>SERVICE CATALOGUE</div><h2 style={styles.sectionTitle}>What would you like cleaned?</h2><p>Tap any service to see the scope, price and terms before booking.</p></div><input style={styles.search} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search cleaning services..."/></div>
      <div style={styles.toolbar}><div>{['All','Personal','Business'].map((x)=><button key={x} onClick={()=>setFilter(x)} style={filter===x?styles.active:styles.pill}>{x}</button>)}</div><small>{visible.length} services</small></div>
      <div style={styles.grid}>{visible.map((s)=><button key={s.id} onClick={()=>open(s)} style={styles.card}><div style={styles.cardImage}><img src={s.image} alt={s.name} style={styles.cardImageImg}/><span style={styles.icon}>{s.icon}</span><span style={styles.tag}>{s.group}</span></div><div style={styles.cardBody}><h3>{s.name}</h3><p>{s.desc}</p><div style={styles.bottom}><strong>{money(s.price)}{s.monthly?' / month':' / '+s.unit}</strong><span>View →</span></div></div></button>)}</div>
      <section style={styles.promise}><div><div style={styles.light}>WHY CLEANOPS</div><h2>See what you are buying before you buy it.</h2><p>Every service shows its scope, exclusions, estimate and applicable terms before confirmation.</p></div><div style={styles.promiseList}><span>✓ Clear inclusions</span><span>✓ Clear exclusions</span><span>✓ Live estimate</span><span>✓ Monthly / annual options</span><span>✓ Digital booking</span><span>✓ Quality follow-up</span></div></section>
      <p style={styles.reference}>Reference imagery is used for visual direction. Replace these references with CleanOps-owned or properly licensed production photography before commercial launch.</p>
    </section>
    {selected&&<div style={styles.overlay}><section style={styles.modal}>{!sent?<><button onClick={()=>setSelected(null)} style={styles.close}>×</button><img src={selected.image} alt="Service reference" style={styles.modalImage}/><div style={styles.service}><span style={styles.big}>{selected.icon}</span><div><div style={styles.eye}>{selected.group.toUpperCase()}</div><h2>{selected.name}</h2><p>{selected.desc}</p></div></div>{selected.monthly&&<><label style={styles.label}>People your facility serves</label><div style={styles.stepper}><button onClick={()=>setPeople(Math.max(1,people-1))}>−</button><b>{people}</b><button onClick={()=>setPeople(people+1)}>+</button></div><label style={styles.label}>Service plan</label><div style={styles.options}><button onClick={()=>setTerm('MONTHLY')} style={term==='MONTHLY'?styles.optionOn:styles.option}><b>Monthly</b><span>{money(businessPrice(selected,people,'MONTHLY'))}/month</span></button><button onClick={()=>setTerm('YEARLY')} style={term==='YEARLY'?styles.optionOn:styles.option}><b>Annual</b><span>{money(businessPrice(selected,people,'YEARLY'))}/year · save 8%</span></button></div></>}<div style={styles.price}><small>ESTIMATED PRICE</small><strong>{money(price)}<i>{selected.monthly?(term==='MONTHLY'?' / month':' / year'):''}</i></strong></div><div style={styles.scope}><div><b>Included</b>{selected.includes.map((x)=><span key={x}>✓ {x}</span>)}</div><div><b>Not included</b>{selected.excludes.map((x)=><span key={x}>× {x}</span>)}</div></div><label style={styles.label}>{selected.monthly?'Business / facility name':'Name / place'}</label><input style={styles.input} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name"/><div style={styles.two}><div><label style={styles.label}>Location</label><input style={styles.input} value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Address / city"/></div><div><label style={styles.label}>Preferred date</label><input type="date" style={styles.input} value={date} onChange={(e)=>setDate(e.target.value)}/></div></div><label style={styles.label}>Frequency</label><select style={styles.input} value={frequency} onChange={(e)=>setFrequency(e.target.value)}><option>One-time</option><option>Daily</option><option>3 days/week</option><option>5 days/week</option><option>Weekly</option></select><label style={styles.label}>Special requirements <small>(optional)</small></label><textarea style={styles.input} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Anything we should know?"/><details style={styles.terms}><summary>Terms & conditions</summary><ul>{TERMS.map((x,i)=><li key={i}>{x}</li>)}</ul></details>{error&&<div style={styles.error}>{error}</div>}<button onClick={book} disabled={busy} style={styles.book}>{busy?'Submitting...':`Book for ${money(price)} →`}</button><p style={styles.fine}>This is an estimate for the selected configuration. CleanOps may confirm final scope before service.</p></>:<div style={styles.success}><div style={styles.check}>✓</div><div style={styles.eye}>REQUEST RECEIVED</div><h2>You're all set.</h2><p>Your {selected.name} request has been received with the displayed estimate.</p><button onClick={()=>setSelected(null)} style={styles.book}>Back to services</button></div>}</section></div>}
  </main>;
}

const styles={
 shell:{minHeight:'100vh',background:'#f6f9f8',color:'#173532',fontFamily:'Inter,system-ui,sans-serif'},
 header:{height:70,padding:'0 5vw',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fff',borderBottom:'1px solid #e1eae7',position:'sticky',top:0,zIndex:20},
 brand:{fontSize:22,fontWeight:900,color:'#0b3a34',textDecoration:'none'},nav:{marginLeft:18,fontSize:13,fontWeight:800,color:'#31544f',textDecoration:'none'},
 hero:{padding:'56px 5vw 52px',display:'grid',gridTemplateColumns:'1.05fr .95fr',gap:42,alignItems:'center',background:'linear-gradient(135deg,#eaf7f3,#fff 68%)'},heroCopy:{maxWidth:680},heroTitle:{fontSize:'clamp(36px,5vw,62px)',lineHeight:1.03,margin:'12px 0'},heroText:{fontSize:18,lineHeight:1.6,color:'#536e68'},heroTrust:{marginTop:22,fontSize:12,color:'#52716b',fontWeight:750},heroImage:{position:'relative',borderRadius:26,overflow:'hidden',height:340,boxShadow:'0 24px 70px rgba(15,60,53,.16)'},heroImageImg:{width:'100%',height:'100%',objectFit:'cover'},imageBadge:{position:'absolute',left:18,bottom:18,padding:'10px 13px',borderRadius:12,background:'rgba(8,43,39,.86)',color:'#fff',fontSize:12,fontWeight:800},
 eye:{fontSize:10,letterSpacing:1.8,fontWeight:900,color:'#0d6b61'},quote:{padding:'42px 7vw',background:'#0b3530',color:'#fff',textAlign:'center'},quoteMark:{fontSize:52,lineHeight:.7,color:'#9ed1c8'},quoteBlockquote:{maxWidth:900,margin:'12px auto',fontSize:25,lineHeight:1.45,fontWeight:650},
 content:{maxWidth:1250,margin:'0 auto',padding:'48px 5vw 70px'},heading:{display:'flex',justifyContent:'space-between',alignItems:'end',gap:30},sectionTitle:{fontSize:34,margin:'8px 0'},search:{width:'min(420px,100%)',boxSizing:'border-box',padding:15,border:'1px solid #d6e4df',borderRadius:13,fontSize:14},toolbar:{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'28px 0 18px'},pill:{padding:'9px 14px',borderRadius:999,border:'1px solid #d7e3df',background:'#fff',marginRight:7,cursor:'pointer'},active:{padding:'9px 14px',borderRadius:999,border:'1px solid #0d6b61',background:'#eaf7f3',color:'#0d5f56',marginRight:7,cursor:'pointer',fontWeight:800},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14},card:{padding:0,textAlign:'left',borderRadius:18,border:'1px solid #dfe9e6',background:'#fff',cursor:'pointer',overflow:'hidden',boxShadow:'0 7px 24px rgba(20,50,45,.035)'},cardImage:{position:'relative',height:155,overflow:'hidden'},cardImageImg:{width:'100%',height:'100%',objectFit:'cover'},icon:{position:'absolute',left:12,bottom:12,fontSize:25,background:'#fff',borderRadius:10,padding:5},tag:{position:'absolute',right:12,top:12,fontSize:10,fontWeight:900,color:'#0d6b61',background:'#edf7f4',padding:'5px 8px',borderRadius:99},cardBody:{padding:18},bottom:{display:'flex',justifyContent:'space-between',marginTop:18,color:'#0d6b61'},promise:{marginTop:55,padding:30,borderRadius:22,background:'#0b3530',color:'#fff',display:'grid',gridTemplateColumns:'1fr 1fr',gap:25},light:{fontSize:10,letterSpacing:1.8,fontWeight:900,color:'#9ed1c8'},promiseList:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignContent:'center',fontWeight:750},reference:{fontSize:11,color:'#758985',marginTop:22},
 overlay:{position:'fixed',inset:0,zIndex:100,background:'rgba(8,31,28,.5)',display:'grid',placeItems:'center',padding:18},modal:{position:'relative',width:'min(650px,100%)',maxHeight:'94vh',overflowY:'auto',background:'#fff',borderRadius:24,padding:28,boxShadow:'0 35px 110px rgba(0,0,0,.25)'},close:{position:'absolute',right:17,top:12,zIndex:2,border:0,background:'rgba(255,255,255,.9)',borderRadius:999,fontSize:29,color:'#6c7d78',cursor:'pointer'},modalImage:{width:'100%',height:190,objectFit:'cover',borderRadius:16,marginBottom:18},service:{display:'flex',gap:15,alignItems:'center',paddingBottom:15,borderBottom:'1px solid #e5ece9'},big:{fontSize:43},label:{display:'block',marginTop:15,fontSize:12,fontWeight:850,color:'#3d5752'},stepper:{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:7,border:'1px solid #cfdcd8',borderRadius:12,overflow:'hidden'},options:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginTop:7},option:{textAlign:'left',padding:13,border:'1px solid #d5e1de',borderRadius:12,background:'#fff',cursor:'pointer'},optionOn:{textAlign:'left',padding:13,border:'1px solid #0d6b61',borderRadius:12,background:'#eef8f5',cursor:'pointer'},price:{marginTop:16,padding:17,borderRadius:15,background:'#edf8f4',border:'1px solid #d4ebe4',display:'grid',gap:3},scope:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:18},terms:{marginTop:16,fontSize:12,color:'#526a65'},input:{width:'100%',boxSizing:'border-box',padding:12,border:'1px solid #d5e1de',borderRadius:10,marginTop:6,font: 'inherit'},two:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10},error:{marginTop:12,padding:10,borderRadius:10,background:'#fff1f0',color:'#a33b31',fontSize:13},book:{width:'100%',marginTop:16,padding:14,border:0,borderRadius:12,background:'#0d6b61',color:'#fff',fontWeight:900,cursor:'pointer'},fine:{fontSize:11,color:'#758985',textAlign:'center'},success:{textAlign:'center',padding:'45px 10px'},check:{width:60,height:60,borderRadius:999,background:'#eaf7f3',color:'#0d6b61',display:'grid',placeItems:'center',margin:'0 auto 18px',fontSize:30,fontWeight:900}
};
