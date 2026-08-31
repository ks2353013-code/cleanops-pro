'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const IMG = {
  home: 'https://storage.googleapis.com/content-assistant-images-persistent/professional-janitorial-team-cleaning-a-commercial-space-with-modern-equipment-64506496-9b67-4ae4-9e70-e06feb734bfe.webp',
  office: 'https://lirp.cdn-website.com/4f9170c1/dms3rep/multi/opt/impresa_di_pulizie_all_service%2B%287%29-640w.png',
  hospital: 'https://irp.cdn-website.com/md/dmaiip/c1e1b746-e7ba-4d54-850b-63f4ceeda9aa.jpg',
  school: 'https://venky.com.au/assets/img/9-Schools-Cleaning.jpg'
};

const personalServices = [
  { id:'home', title:'Home cleaning', sub:'Everyday cleaning', icon:'🏠', image:IMG.home },
  { id:'bathroom', title:'Bathroom cleaning', sub:'Deep hygiene clean', icon:'🚿', image:IMG.home, price:199 },
  { id:'kitchen', title:'Kitchen cleaning', sub:'Kitchen & surfaces', icon:'🍳', image:IMG.home, price:249 },
  { id:'deep', title:'Deep home cleaning', sub:'Top-to-bottom clean', icon:'✨', image:IMG.home, price:1999 },
  { id:'sofa', title:'Sofa & carpet', sub:'Fabric & upholstery', icon:'🛋️', image:IMG.home, price:1299 },
  { id:'glass', title:'Glass & windows', sub:'Windows & frames', icon:'🪟', image:IMG.office, price:1499 }
];

const commercialServices = [
  { id:'office', title:'Office', sub:'Workplace cleaning', icon:'🏢' },
  { id:'corporate', title:'Corporate', sub:'Large workplace', icon:'🏙️' },
  { id:'hospital', title:'Hospital', sub:'Healthcare hygiene', icon:'🏥' },
  { id:'school', title:'School', sub:'Campus cleaning', icon:'🏫' },
  { id:'hotel', title:'Hotel', sub:'Guest-ready spaces', icon:'🏨' },
  { id:'factory', title:'Factory', sub:'Industrial cleaning', icon:'🏭' },
  { id:'warehouse', title:'Warehouse', sub:'Storage facilities', icon:'📦' },
  { id:'retail', title:'Retail', sub:'Customer-facing stores', icon:'🛍️' }
];

const frequencies = [
  ['ONCE','One time'],['WEEKLY','Weekly'],['TWICE','2× / week'],['THREE','3× / week'],['WEEKDAYS','5 days / week'],['DAILY','Daily']
];
const visits = {ONCE:1,WEEKLY:4.33,TWICE:8.67,THREE:13,WEEKDAYS:22,DAILY:26};
const hours = [1,2,3,4,6,8];

function professionals(sector, area, people) {
  const a=Number(area)||0, p=Number(people)||0;
  const rules={HOSPITAL:[3500,50],SCHOOL:[7000,250],HOTEL:[5000,40],FACTORY:[6000,0],WAREHOUSE:[8000,0],CORPORATE:[3500,75],OFFICE:[3500,75],RETAIL:[4000,100]};
  const [areaUnit,peopleUnit]=rules[sector]||rules.OFFICE;
  return Math.max(1,Math.ceil(a/areaUnit)+(peopleUnit?Math.ceil(p/peopleUnit):0));
}

function rate(sector){return {OFFICE:420,CORPORATE:480,HOSPITAL:650,SCHOOL:380,HOTEL:520,FACTORY:500,WAREHOUSE:420,RETAIL:450}[sector]||420;}

export default function Client(){
  const params=useMemo(()=>new URLSearchParams(typeof window!=='undefined'?window.location.search:''),[]);
  const initial=params.get('service');
  const [mode,setMode]=useState('personal');
  const [service,setService]=useState(personalServices.some(x=>x.id===initial)?initial:'home');
  const [sector,setSector]=useState('OFFICE');
  const [hours,setHours]=useState(2);
  const [frequency,setFrequency]=useState('ONCE');
  const [area,setArea]=useState(5000);
  const [people,setPeople]=useState(50);
  const [commercialHours,setCommercialHours]=useState(8);
  const [date,setDate]=useState('');
  const [time,setTime]=useState('');
  const [message,setMessage]=useState('');

  const commercial=mode==='commercial';
  const selectedPersonal=personalServices.find(x=>x.id===service)||personalServices[0];
  const team=professionals(sector,area,people);
  const monthlyVisits=visits[frequency]||1;
  const personalPrice=service==='home'?hours*55:(selectedPersonal.price||55);
  const visitPrice=Math.round(rate(sector)*team*Math.max(1,commercialHours/8));
  const monthlyPrice=Math.round(visitPrice*monthlyVisits);

  async function book(){
    setMessage('');
    try{
      const r=await fetch('/api/client/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        facilityName:commercial?`${sector} facility`:'Home',facilityType:commercial?sector:'RESIDENTIAL',areaSqFt:commercial?area:undefined,
        serviceName:commercial?`${sector} Cleaning`:`${selectedPersonal.title} · ${hours} hour${hours>1?'s':''}`,
        requirements:commercial?`${team} professionals · ${frequency} · ${commercialHours} hours/day · ${people} people served`:`${hours} hour personal cleaning`,preferredDate:date?new Date(`${date}T${time||'09:00'}`).toISOString():new Date().toISOString()
      })});
      const x=await r.json();
      if(r.ok)setMessage('Request received. We’ll confirm your service shortly.');
      else if(r.status===401)setMessage('Please sign in with your mobile number to continue.');
      else setMessage(x.error||'Unable to create booking.');
    }catch{setMessage('Unable to connect. Please try again.');}
  }

  return <main style={s.page}>
    <header style={s.header}>
      <Link href="/" style={s.logo}>CleanOps<span>•</span></Link>
      <div style={s.location}>📍 <b>Delivering to</b> <span>Your location</span> ▾</div>
      <div style={s.headerRight}><Link href="/" style={s.headerLink}>Home</Link><Link href="/customer-login" style={s.headerLink}>Account</Link></div>
    </header>

    <div style={s.mobileTop}><div><small>Delivering to</small><b>📍 Select your location</b></div><Link href="/customer-login" style={s.profile}>●</Link></div>

    <section style={s.hero}>
      <div style={s.heroCopy}><div style={s.badge}>CLEANOPS HOME & BUSINESS SERVICES</div><h1>Get it cleaned.<br/><em>Get on with your day.</em></h1><p>Professional cleaning, clear pricing and trusted service — booked in a few taps.</p></div>
      <img src={IMG.home} alt="CleanOps professional cleaning" style={s.heroImage}/>
    </section>

    <div style={s.shell}>
      <div style={s.modeSwitch}>
        <button onClick={()=>setMode('personal')} style={mode==='personal'?s.modeActive:s.mode}>🏠 Personal</button>
        <button onClick={()=>setMode('commercial')} style={commercial?s.modeActive:s.mode}>🏢 Business & institutions</button>
      </div>

      {!commercial ? <>
        <section><div style={s.sectionHead}><div><h2>Cleaning services</h2><p>Choose a service. See exactly what you get.</p></div><span style={s.chev}>→</span></div>
          <div style={s.serviceScroller}>{personalServices.map(x=><button key={x.id} onClick={()=>setService(x.id)} style={service===x.id?s.serviceActive:s.service}>
            <div style={s.servicePic}><img src={x.image} alt=""/></div><span style={s.serviceIcon}>{x.icon}</span><b>{x.title}</b><small>{x.sub}</small>{x.price&&<strong>from ₹{x.price}</strong>}
          </button>)}</div>
        </section>

        {service==='home' && <section style={s.card}><div style={s.cardTitle}><div><span style={s.greenTag}>POPULAR</span><h3>Hourly home cleaning</h3><p>Simple hourly help for everyday cleaning.</p></div><strong>₹55<span>/hr</span></strong></div>
          <div style={s.optionRow}>{hours.map(h=><button key={h} onClick={()=>setHours(h)} style={hours===h?s.optionActive:s.option}>{h} hr<br/><small>₹{h*55}</small></button>)}</div>
          <div style={s.includes}><b>Includes</b><span>✓ Sweeping & mopping</span><span>✓ Dusting</span><span>✓ Kitchen exterior</span><span>✓ Bathroom cleaning</span></div>
        </section>}

        {service!=='home' && <section style={s.card}><div style={s.cardTitle}><div><span style={s.greenTag}>CLEAR SCOPE</span><h3>{selectedPersonal.title}</h3><p>{selectedPersonal.sub}. Professional arrives with the required cleaning kit.</p></div><strong>₹{personalPrice.toLocaleString('en-IN')}</strong></div><div style={s.includes}><b>What's included</b><span>✓ Professional cleaning</span><span>✓ Standard cleaning supplies</span><span>✓ Quality check</span><span>✓ No hidden charges for the agreed scope</span></div></section>}

        <section style={s.scheduleCard}><h3>When should we come?</h3><div style={s.scheduleGrid}><label><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label><span>Time</span><select value={time} onChange={e=>setTime(e.target.value)}><option value="">Choose time</option><option>08:00</option><option>10:00</option><option>12:00</option><option>14:00</option><option>16:00</option><option>18:00</option></select></label></div></section>
      </> : <>
        <section><div style={s.sectionHead}><div><h2>Business & institution cleaning</h2><p>Tell us about the site. CleanOps calculates the team and monthly estimate.</p></div></div>
          <div style={s.businessGrid}>{commercialServices.map(x=><button key={x.id} onClick={()=>setSector(x.id.toUpperCase())} style={sector===x.id.toUpperCase()?s.businessActive:s.businessCard}><span>{x.icon}</span><b>{x.title}</b><small>{x.sub}</small></button>)}</div>
        </section>
        <section style={s.formCard}><div style={s.formGrid}><label><span>Facility area</span><div><input type="number" min="100" value={area} onChange={e=>setArea(Number(e.target.value))}/><i>sq ft</i></div></label><label><span>People served</span><input type="number" min="1" value={people} onChange={e=>setPeople(Number(e.target.value))}/></label><label><span>Cleaning hours / day</span><input type="number" min="2" max="16" value={commercialHours} onChange={e=>setCommercialHours(Number(e.target.value))}/></label></div>
          <div><span style={s.label}>HOW OFTEN?</span><div style={s.freqScroller}>{frequencies.map(([id,label])=><button key={id} onClick={()=>setFrequency(id)} style={frequency===id?s.freqActive:s.freq}>{label}</button>)}</div></div>
        </section>
        <section style={s.quoteCard}><div><span style={s.label}>YOUR CLEANOPS TEAM</span><strong>{team} professionals</strong><p>Recommended from facility type, area and people served.</p></div><div style={s.quotePrice}><span style={s.label}>ESTIMATED PRICE</span><strong>₹{monthlyPrice.toLocaleString('en-IN')}<small>/month</small></strong><p>₹{visitPrice.toLocaleString('en-IN')} per visit · {monthlyVisits} visits/month</p></div></section>
        <section style={s.commercialNote}><b>What your plan can include</b><span>✓ Dedicated cleaning workforce</span><span>✓ Washrooms, common areas & agreed work areas</span><span>✓ Routine quality checks & service records</span><small>Final staffing and price are confirmed for the agreed site scope. Specialist, hazardous or unusual work is quoted separately.</small></section>
      </>}

      <button onClick={book} style={s.bottomBook}>{commercial?`Continue · ₹${monthlyPrice.toLocaleString('en-IN')}/month`:`Continue · ₹${personalPrice.toLocaleString('en-IN')}`} <span>→</span></button>
      {message&&<div style={s.message}>{message}{message.includes('mobile')&&<Link href="/customer-login"> Sign in →</Link>}</div>}
      <div style={s.trustRow}><span>✓ Verified professionals</span><span>✓ Transparent pricing</span><span>✓ CleanOps quality checks</span></div>
    </div>

    <nav style={s.bottomNav}><Link href="/client" style={s.bottomActive}>⌂<small>Home</small></Link><Link href="/client" style={s.bottomItem}>▣<small>Bookings</small></Link><Link href="/customer-login" style={s.bottomItem}>●<small>Account</small></Link></nav>
  </main>
}

const s={
 page:{minHeight:'100vh',background:'#f7f8f7',color:'#151b19',fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',paddingBottom:90},
 header:{height:68,padding:'0 clamp(18px,5vw,72px)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fff',borderBottom:'1px solid #ecefed',position:'sticky',top:0,zIndex:30},
 logo:{fontSize:25,fontWeight:950,color:'#111',textDecoration:'none',letterSpacing:-1},location:{display:'flex',gap:7,alignItems:'center',fontSize:12,color:'#5b6561'},headerRight:{display:'flex',gap:18},headerLink:{fontSize:13,fontWeight:800,color:'#242b28',textDecoration:'none'},mobileTop:{display:'none'},profile:{color:'#111',textDecoration:'none'},
 hero:{maxWidth:1200,margin:'0 auto',padding:'26px 20px 22px',display:'grid',gridTemplateColumns:'1.05fr .95fr',gap:20,alignItems:'stretch'},heroCopy:{background:'#e8f6ef',borderRadius:22,padding:'42px 38px',display:'flex',flexDirection:'column',justifyContent:'center'},badge:{fontSize:10,letterSpacing:1.5,fontWeight:900,color:'#11805d',marginBottom:12},heroCopyH1:{},heroImage:{width:'100%',height:310,objectFit:'cover',borderRadius:22},
 shell:{maxWidth:1200,margin:'0 auto',padding:'0 20px'},modeSwitch:{display:'flex',gap:6;background:'#ecefed;padding:5px;borderRadius:13px;width:'fit-content',margin:'8px 0 32px'},mode:{border:0;background:'transparent;padding:'11px 18px',borderRadius:9,fontWeight:850,color:'#65706c',cursor:'pointer'},modeActive:{border:0;background:'#111',color:'#fff',padding:'11px 18px',borderRadius:9,fontWeight:900,cursor:'pointer'},sectionHead:{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:16},sectionH2:{},sectionHeadP:{},chev:{fontSize:20,color:'#777'},serviceScroller:{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,overflowX:'auto',paddingBottom:8},service:{border:0,background:'#fff',borderRadius:15,padding:0  ,textAlign:'left',cursor:'pointer',boxShadow:'0 2px 10px rgba(0,0,0,.04)',overflow:'hidden'},serviceActive:{border:'2px solid #111',background:'#fff',borderRadius:15,padding:0,textAlign:'left',cursor:'pointer',boxShadow:'0 4px 15px rgba(0,0,0,.08)',overflow:'hidden'},servicePic:{height:100,overflow:'hidden'},servicePicImg:{},serviceIcon:{fontSize:20,display:'block',padding:'9px 12px 0'},serviceB:{},serviceSmall:{},serviceStrong:{},
 card:{background:'#fff',borderRadius:18,padding:22,marginTop:22,border:'1px solid #e7ebe8'},cardTitle:{display:'flex',justifyContent:'space-between',gap:20,alignItems:'start'},greenTag:{display:'inline-block',fontSize:9,letterSpacing:1.2,fontWeight:900,color:'#11805d',background:'#e9f8f0',padding:'5px 7px',borderRadius:5},cardH3:{},cardP:{},cardTitleStrong:{fontSize:28,fontWeight:950,whiteSpace:'nowrap'},cardTitleStrongSpan:{fontSize:12,fontWeight:700,color:'#78817e'},optionRow:{display:'flex',gap:9,flexWrap:'wrap',marginTop:20},option:{padding:'12px 18px',border:'1px solid #dfe4e1',background:'#fff',borderRadius:10,fontWeight:850,cursor:'pointer'},optionActive:{padding:'12px 18px',border:'1px solid #111',background:'#111',color:'#fff',borderRadius:10,fontWeight:900,cursor:'pointer'},includes:{display:'flex',gap:14,flexWrap:'wrap',paddingTop:18,marginTop:18,borderTop:'1px solid #edf0ee',fontSize:12,color:'#53605b'},
 scheduleCard:{background:'#fff',borderRadius:18,padding:22,marginTop:16,border:'1px solid #e7ebe8'},scheduleGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12},label:{fontSize:10,letterSpacing:1.3,fontWeight:900,color:'#69736f'},
 businessGrid:{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:10},businessCard:{border:'1px solid #e2e7e4',background:'#fff',borderRadius:14,padding:'15px 10px',cursor:'pointer',textAlign:'left'},businessActive:{border:'2px solid #111',background:'#f1f5f2',borderRadius:14,padding:'14px 9px',cursor:'pointer',textAlign:'left'},businessCardSpan:{fontSize:23,display:'block'},businessCardB:{display:'block',marginTop:8},businessCardSmall:{display:'block'},
 formCard:{background:'#fff',border:'1px solid #e5e9e7',borderRadius:18,padding:22,marginTop:20,display:'grid',gap:22},formGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14},fieldLabel:{},fieldInput:{},freqScroller:{display:'flex',gap:8,overflowX:'auto',paddingTop:9},freq:{border:'1px solid #dfe4e1',background:'#fff',borderRadius:9,padding:'10px 14px',fontWeight:800,whiteSpace:'nowrap'},freqActive:{border:'1px solid #111',background:'#111',color:'#fff',borderRadius:9,padding:'10px 14px',fontWeight:900,whiteSpace:'nowrap'},
 quoteCard:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,marginTop:16,background:'#111',color:'#fff',borderRadius:18,overflow:'hidden'},quoteCardDiv:{padding:25},quotePrice:{padding:25,background:'#173a30'},quoteStrong:{display:'block',fontSize:36,marginTop:7},quoteStrongSmall:{fontSize:12,color:'#b7c9c3'},commercialNote:{display:'grid',gap:9,background:'#fff',border:'1px solid #e5e9e7',borderRadius:18,padding:20,marginTop:14,fontSize:13,color:'#52605a'},
 bottomBook:{width:'100%',border:0,background:'#111',color:'#fff',padding:'17px 20px',borderRadius:13,fontSize:15,fontWeight:950,cursor:'pointer',marginTop:22,display:'flex',justifyContent:'space-between'},message:{marginTop:12,padding:13,borderRadius:10,background:'#e8f7ee',color:'#185b3f',fontWeight:800,textAlign:'center'},trustRow:{display:'flex',justifyContent:'center',gap:22,flexWrap:'wrap',fontSize:11,color:'#69746f',padding:'20px 0 30px'},bottomNav:{position:'fixed',display:'none',bottom:0,left:0,right:0,height:68,background:'#fff',borderTop:'1px solid #e7ebe9',zIndex:40,justifyContent:'space-around'},bottomItem:{textDecoration:'none',color:'#7b8581',fontSize:18,textAlign:'center',paddingTop:8},bottomActive:{textDecoration:'none',color:'#111',fontSize:18,textAlign:'center',paddingTop:8}
};
