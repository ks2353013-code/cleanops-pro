'use client';
import {useEffect} from 'react';
export default function OperationsRedirect(){useEffect(()=>{location.replace('/ops')},[]);return <main style={{padding:40,fontFamily:'Inter,system-ui'}}>Opening CleanOps Control Center…</main>}
