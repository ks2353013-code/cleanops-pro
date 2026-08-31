'use client';
import { useEffect, useMemo, useState } from 'react';

const money = (n, currency='INR') => new Intl.NumberFormat('en-IN', { style:'currency', currency }).format(Number(n || 0));
const labels = { ISSUED:'Issued', SENT:'Sent', PARTIALLY_PAID:'Partially paid', PAID:'Paid', OVERDUE:'Overdue', VOID:'Void', CANCELLED:'Cancelled' };

export default function Financials() {
  const [invoices, setInvoices] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { const r = await fetch('/api/invoices', { cache:'no-store' }); const x = await r.json(); if (!r.ok) throw new Error(x.error || 'Unable to load'); setInvoices(x.data || []); }
    catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const totals = useMemo(() => invoices.reduce((a, i) => {
    const paid = (i.payments || []).filter(p => p.status === 'SUCCESS').reduce((s,p) => s + Number(p.amount), 0);
    a.billed += Number(i.amount); a.paid += paid; a.outstanding += Math.max(0, Number(i.amount) - paid); return a;
  }, { billed:0, paid:0, outstanding:0 }), [invoices]);

  return <main style={{fontFamily:'Inter,system-ui',padding:32,maxWidth:1200,margin:'auto'}}>
    <a href="/client">← Client Portal</a>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,margin:'20px 0'}}><div><h1 style={{marginBottom:6}}>Financials</h1><p style={{color:'#64748b'}}>Invoices, payments and outstanding balances.</p></div><button onClick={load} style={{padding:'10px 14px',border:'1px solid #cbd5e1',background:'#fff',borderRadius:8}}>Refresh</button></header>
    {msg && <div style={{padding:12,background:'#fff7ed',borderRadius:8,marginBottom:16}}>{msg}</div>}
    <section style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:22}}>
      {[['Total billed',totals.billed],['Paid',totals.paid],['Outstanding',totals.outstanding]].map(([t,v])=><article key={t} style={{border:'1px solid #e5eaee',borderRadius:14,padding:18}}><small style={{color:'#64748b'}}>{t}</small><h2 style={{margin:'8px 0'}}>{money(v)}</h2></article>)}
    </section>
    <section style={{border:'1px solid #e5eaee',borderRadius:14,overflow:'auto'}}>
      {loading ? <p style={{padding:20}}>Loading invoices…</p> : invoices.length === 0 ? <p style={{padding:20}}>No invoices available.</p> : <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Invoice','Contract','Amount','Paid','Balance','Due','Status'].map(h=><th key={h} style={{textAlign:'left',padding:14,borderBottom:'1px solid #e5eaee',fontSize:13}}>{h}</th>)}</tr></thead><tbody>{invoices.map(i=>{const paid=(i.payments||[]).filter(p=>p.status==='SUCCESS').reduce((s,p)=>s+Number(p.amount),0); const balance=Math.max(0,Number(i.amount)-paid); return <tr key={i.id}><td style={{padding:14}}><strong>{i.invoiceNumber}</strong></td><td style={{padding:14}}>{i.contract?.name || '—'}</td><td style={{padding:14}}>{money(i.amount,i.currency)}</td><td style={{padding:14}}>{money(paid,i.currency)}</td><td style={{padding:14}}>{money(balance,i.currency)}</td><td style={{padding:14}}>{i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-IN') : '—'}</td><td style={{padding:14}}><span style={{padding:'5px 8px',borderRadius:999,background:'#f1f5f9'}}>{labels[i.status] || i.status}</span></td></tr>})}</tbody></table>}
    </section>
  </main>;
}
