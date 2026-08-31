'use client';

import Link from 'next/link';

const IMG = {
  team: 'https://storage.googleapis.com/content-assistant-images-persistent/professional-janitorial-team-cleaning-a-commercial-space-with-modern-equipment-64506496-9b67-4ae4-9e70-e06feb734bfe.webp',
  office: 'https://lirp.cdn-website.com/4f9170c1/dms3rep/multi/opt/impresa_di_pulizie_all_service%2B%287%29-640w.png',
  hospital: 'https://irp.cdn-website.com/md/dmaiip/c1e1b746-e7ba-4d54-850b-63f4ceeda9aa.jpg',
  school: 'https://venky.com.au/assets/img/9-Schools-Cleaning.jpg'
};

const services = [
  ['Office cleaning','Daily, weekly or managed workplace cleaning.','From ₹6,500/month',IMG.office],
  ['Hospital & healthcare','Hygiene-focused cleaning programs for clinical environments.','From ₹9,500/month',IMG.hospital],
  ['School & campus','Reliable daily cleaning for classrooms and shared spaces.','From ₹7,500/month',IMG.school],
  ['Home cleaning','Simple one-time and recurring cleaning for homes.','From ₹999/visit',IMG.team],
  ['Factory & warehouse','Industrial housekeeping and facility cleaning.','From ₹8,000/month',IMG.team],
  ['Deep & special cleaning','Detailed resets, floors, carpets, glass and handover cleans.','From ₹1,299',IMG.office]
];

const steps = [
  ['01','Choose','Pick the service you need.'],
  ['02','Configure','Tell us the people, frequency and location.'],
  ['03','See your estimate','Get a clear ₹ estimate before requesting service.'],
  ['04','We deliver','CleanOps assigns the right professional and manages quality.']
];

export default function Home(){
  return <main style={s.page}>
    <header style={s.header}>
      <Link href="/" style={s.logo}>CleanOps <span>Pro</span></Link>
      <nav style={s.nav}>
        <a href="#services" style={s.navLink}>Services</a>
        <a href="#business" style={s.navLink}>For business</a>
        <a href="#how" style={s.navLink}>How it works</a>
        <Link href="/customer-login" style={s.navLink}>Customer login</Link>
        <Link href="/team-login" style={s.teamBtn}>Team access</Link>
      </nav>
    </header>

    <section style={s.hero}>
      <div style={s.heroInner}>
        <div style={s.heroCopy}>
          <div style={s.kicker}>PROFESSIONAL CLEANING, MADE SIMPLE</div>
          <h1 style={s.h1}>A cleaner place.<br/><i>Without the hassle.</i></h1>
          <p style={s.lead}>Book professional cleaning for your home, office, school, hospital or commercial facility. See the service, scope and estimated ₹ price before you request it.</p>
          <div style={s.actions}>
            <Link href="/client" style={s.primary}>Explore services <b>→</b></Link>
            <Link href="/customer-login" style={s.secondary}>Sign in with mobile</Link>
          </div>
          <div style={s.trust}><span>✓ Verified professionals</span><span>✓ Clear pricing</span><span>✓ Quality managed</span></div>
        </div>
        <div style={s.heroVisual}>
          <img src={IMG.team} alt="CleanOps professional cleaning team" style={s.heroImg}/>
          <div style={s.floatCard}><small>POPULAR FOR BUSINESS</small><strong>Office Cleaning</strong><span>Recurring service from <b>₹6,500/month</b></span><Link href="/client?service=Office%20Cleaning">See service →</Link></div>
        </div>
      </div>
    </section>

    <section style={s.band}>
      <div><b>One service company.</b> Multiple places we keep clean.</div>
      <div style={s.bandItems}><span>OFFICES</span><span>HEALTHCARE</span><span>SCHOOLS</span><span>RETAIL</span><span>INDUSTRIAL</span></div>
    </section>

    <section id="services" style={s.section}>
      <div style={s.sectionTop}><div><div style={s.kicker}>OUR SERVICES</div><h2 style={s.h2}>Choose what you need.</h2><p style={s.muted}>Simple service cards. Clear scope. No sales call just to discover the basics.</p></div><Link href="/client" style={s.outline}>View all services →</Link></div>
      <div style={s.serviceGrid}>{services.map(([name,desc,price,img])=><Link href={'/client?service='+encodeURIComponent(name)} key={name} style={s.serviceCard}><div style={s.serviceImage}><img src={img} alt={name}/></div><div style={s.serviceBody}><div style={s.serviceMeta}>CLEANOPS SERVICE</div><h3>{name}</h3><p>{desc}</p><div style={s.serviceBottom}><strong>{price}</strong><span>View →</span></div></div></Link>)}</div>
    </section>

    <section id="business" style={s.business}>
      <div style={s.businessInner}>
        <div><div style={s.kickerLight}>FOR BUSINESSES & INSTITUTIONS</div><h2 style={s.h2Light}>Cleaning that scales with the people you serve.</h2><p style={s.businessText}>For offices, schools, hospitals, hotels, factories and facilities. Choose a service, tell us how many people the site serves, select monthly or annual coverage and get an estimate.</p><Link href="/client" style={s.lightBtn}>Build your cleaning plan →</Link></div>
        <div style={s.plan}><div style={s.planTop}><span>EXAMPLE</span><b>Office · 50 people</b></div><div style={s.planPrice}>₹9,425 <small>/ month</small></div><div style={s.planRows}><span>Daily cleaning</span><span>Washrooms + pantry</span><span>Waste handling</span><span>Quality checks</span></div><div style={s.planNote}>Final price depends on selected scope, frequency and site conditions.</div></div>
      </div>
    </section>

    <section id="how" style={s.section}>
      <div style={s.kicker}>HOW CLEANOPS WORKS</div><h2 style={s.h2}>From tap to clean.</h2><p style={s.muted}>The customer should never have to understand our internal operations.</p>
      <div style={s.steps}>{steps.map(([n,t,d])=><article key={n} style={s.step}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>

    <section style={s.promise}><div style={s.quote}>“</div><div><blockquote>Clean spaces are not a luxury. They are part of how a great home, workplace and institution should feel.</blockquote><span>— The CleanOps service promise</span></div></section>

    <section style={s.final}><div style={s.kicker}>READY WHEN YOU ARE</div><h2 style={s.h2}>Tell us what needs cleaning.</h2><p>Choose a service and see the details before you book.</p><Link href="/client" style={s.primary}>Explore CleanOps →</Link></section>

    <footer style={s.footer}><div><Link href="/" style={s.logo}>CleanOps <span>Pro</span></Link><p>Professional cleaning services for homes, workplaces and institutions.</p></div><div style={s.footerLinks}><Link href="/client">Services</Link><Link href="/customer-login">Customer login</Link><Link href="/team-login">Team access</Link><Link href="/register">Register</Link></div><small>© 2026 CleanOps Pro. Service availability and pricing may vary by location.</small></footer>
  </main>
}

const s={
 page:{minHeight:'100vh',background:'#f7faf9',color:'#163a35',fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'},
 header:{height:72,padding:'0 clamp(20px,5vw,72px)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.94)',borderBottom:'1px solid #dfe9e5',position:'sticky',top:0,zIndex:50,backdropFilter:'blur(14px)'},
 logo:{fontSize:23,fontWeight:900,letterSpacing:-.7,color:'#0a3d36',textDecoration:'none'},logoSpan:{},nav:{display:'flex',alignItems:'center',gap:4},navLink:{padding:'10px 12px',fontSize:13,fontWeight:800,color:'#42615b',textDecoration:'none'},teamBtn:{padding:'11px 15px',borderRadius:10,background:'#0c6b60',color:'#fff',fontSize:13,fontWeight:900,textDecoration:'none',marginLeft:5},
 hero:{background:'linear-gradient(120deg,#eaf7f3 0%,#f7faf9 55%,#e1f1ed 100%)',borderBottom:'1px solid #dfeae6'},heroInner:{maxWidth:1240,margin:'0 auto',padding:'76px 24px 86px',display:'grid',gridTemplateColumns:'1.02fr .98fr',gap:62,alignItems:'center'},heroCopy:{maxWidth:690},kicker:{fontSize:11,letterSpacing:2,fontWeight:900,color:'#0d6b61',marginBottom:16},h1:{fontSize:'clamp(48px,6vw,76px)',lineHeight:1.02,letterSpacing:-3.5,margin:'0 0 24px',fontWeight:900,color:'#103d37'},lead:{fontSize:18,lineHeight:1.7,color:'#61746f',maxWidth:650,margin:0},actions:{display:'flex',gap:10,flexWrap:'wrap',marginTop:30},primary:{display:'inline-flex',alignItems:'center',gap:10,padding:'15px 20px',borderRadius:11,background:'#0d6b61',color:'#fff',textDecoration:'none',fontWeight:900},secondary:{display:'inline-flex',alignItems:'center',padding:'14px 19px',borderRadius:11,background:'#fff',border:'1px solid #d3e2de',color:'#204c45',textDecoration:'none',fontWeight:900},trust:{display:'flex',gap:18,flexWrap:'wrap',marginTop:22,fontSize:12,fontWeight:750,color:'#54706a'},heroVisual:{position:'relative',minHeight:470},heroImg:{width:'100%',height:470,objectFit:'cover',borderRadius:28,display:'block',boxShadow:'0 28px 70px rgba(15,60,53,.17)'},floatCard:{position:'absolute',left:-25,bottom:25,width:270,padding:20,borderRadius:18,background:'#fff',boxShadow:'0 20px 50px rgba(15,60,53,.17)',border:'1px solid #e0e9e6',display:'grid',gap:6},floatCardSmall:{},
 band:{display:'flex',justifyContent:'space-between',gap:25,alignItems:'center',padding:'21px 5vw',background:'#0b3934',color:'#dcece8',fontSize:13,fontWeight:750},bandItems:{display:'flex',gap:28,flexWrap:'wrap',fontSize:10,letterSpacing:1.4,color:'#9fcac2'},
 section:{maxWidth:1240,margin:'0 auto',padding:'82px 24px'},sectionTop:{display:'flex',justifyContent:'space-between',alignItems:'end',gap:25,marginBottom:30},h2:{fontSize:'clamp(34px,4vw,48px)',letterSpacing:-2,margin:'0 0 10px',color:'#123c36',lineHeight:1.08},muted:{color:'#70827e',fontSize:15,lineHeight:1.6,margin:0},outline:{border:'1px solid #cbdcd7',borderRadius:10,padding:'11px 15px',color:'#1e5149',textDecoration:'none',fontWeight:850,fontSize:13,whiteSpace:'nowrap'},serviceGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16},serviceCard:{background:'#fff',border:'1px solid #dfe9e6',borderRadius:18,overflow:'hidden',textDecoration:'none',color:'#173a35',boxShadow:'0 8px 30px rgba(20,50,45,.045)'},serviceImage:{height:190,overflow:'hidden'},serviceImageImg:{},serviceBody:{padding:20},serviceMeta:{fontSize:9,letterSpacing:1.5,fontWeight:900,color:'#0d6b61'},serviceH3:{},serviceBottom:{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:18,paddingTop:14,borderTop:'1px solid #edf2f0'},
 business:{background:'#0b3934',color:'#fff'},businessInner:{maxWidth:1120,margin:'0 auto',padding:'84px 24px',display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:70,alignItems:'center'},kickerLight:{fontSize:11,letterSpacing:2,fontWeight:900,color:'#9bd1c7',marginBottom:16},h2Light:{fontSize:'clamp(36px,4vw,52px)',lineHeight:1.08,letterSpacing:-2,margin:'0 0 18px'},businessText:{color:'#b9d0cb',fontSize:16,lineHeight:1.7,maxWidth:650},lightBtn:{display:'inline-block',marginTop:25,padding:'14px 19px',borderRadius:10,background:'#dff4ee',color:'#0b5149',fontWeight:900,textDecoration:'none'},plan:{background:'#fff',color:'#173a35',borderRadius:22,padding:25,boxShadow:'0 25px 65px rgba(0,0,0,.2)'},planTop:{display:'flex',justifyContent:'space-between',fontSize:12},planPrice:{fontSize:42,fontWeight:900,letterSpacing:-2,margin:'25px 0 20px'},planRows:{display:'grid',gap:10,borderTop:'1px solid #e4ece9',paddingTop:17,fontSize:13,color:'#58706b'},planNote:{fontSize:10,lineHeight:1.5,color:'#8a9a96',marginTop:18},
 steps:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginTop:32},step:{background:'#fff',border:'1px solid #dfe9e6',borderRadius:16,padding:22,minHeight:170},stepSpan:{},
 promise:{maxWidth:1120,margin:'0 auto 82px',padding:'42px 50px',background:'#e9f5f1',borderRadius:24,display:'flex',gap:22,alignItems:'flex-start'},quote:{fontSize:68,lineHeight:.8,color:'#0d6b61',fontWeight:900},promiseBlockquote:{},
 final:{textAlign:'center',padding:'86px 24px',background:'#edf6f3',borderTop:'1px solid #dce9e5'},footer:{padding:'42px 5vw',display:'grid',gridTemplateColumns:'1fr auto',gap:25,background:'#fff',borderTop:'1px solid #dfe9e6',color:'#71827e'},footerLinks:{display:'flex',gap:18,flexWrap:'wrap',alignItems:'start'},footerLink:{color:'#3e5e58',textDecoration:'none',fontSize:12,fontWeight:800}
};

// Keep responsive layout in the browser without introducing a second styling system.
if(typeof document!=='undefined'){
  const style=document.getElementById('cleanops-responsive');
  if(!style){const el=document.createElement('style');el.id='cleanops-responsive';el.textContent=`@media(max-width:900px){header{height:auto!important;min-height:68px}.nav{display:none!important}.heroInner{grid-template-columns:1fr!important;padding-top:52px!important}.heroVisual{min-height:350px!important}.heroImg{height:350px!important}.floatCard{left:12px!important}.serviceGrid{grid-template-columns:repeat(2,1fr)!important}.businessInner{grid-template-columns:1fr!important;gap:35px!important}.steps{grid-template-columns:repeat(2,1fr)!important}.band{flex-direction:column!important;align-items:flex-start!important}.footer{grid-template-columns:1fr!important}}@media(max-width:560px){.serviceGrid{grid-template-columns:1fr!important}.steps{grid-template-columns:1fr!important}.promise{margin-left:20px!important;margin-right:20px!important;padding:30px!important}.bandItems{gap:12px!important}.h1{font-size:46px!important;letter-spacing:-2px!important}}`;document.head.appendChild(el)}
}
