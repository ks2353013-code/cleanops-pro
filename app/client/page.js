'use client';
import { useState } from 'react';

export default function ClientPortal(){
 const [sent,setSent]=useState(false);
 return <main style={{fontFamily:'Inter,system-ui',padding:32,maxWidth:1000,margin:'auto'}}><a href="/">← Operations</a><h1>Client Portal</h1><p>Request and manage commercial cleaning for your facilities.</p><section style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
 <div style={{border:'1px solid #e5eaee',borderRadius:14,padding:20}}><h2>Request service</h2><label>Facility<br/><input id="facility" placeholder="Main Campus" style={{width:'100%',padding:10,margin:'6px 0 12px'}}/></label><label>Service<br/><select id="service" style={{width:'100%',padding:10,margin:'6px 0 12px'}}><option>Recurring Cleaning</option><option>Deep Cleaning</option><option>Sanitation</option><option>Floor & Carpet Care</option></select></label><button onClick={()=>setSent(true)} style={{padding:'10px 14px',background:'#0d6b61',color:'#fff',border:0,borderRadius:8}}>{sent?'Request Submitted':'Request Assessment'}</button></div>
 <div style={{border:'1px solid #e5eaee',borderRadius:14,padding:20}}><h2>Active service</h2><p><b>Apex Facility</b></p><p>Daily cleaning · Team 07</p><p>Next inspection: tomorrow</p><p>Contract status: <b>Active</b></p></div></section></main>
}
