'use client';
import { useEffect, useRef } from 'react';
import { mountPlaybeatLock } from '../../../components/playbeat-lock.mjs';
export default function SignIn() {
  const host = useRef(null);
  useEffect(() => mountPlaybeatLock(host.current, async (pin) => {
    const next = new URLSearchParams(window.location.search).get('next') || '/admin/command-center';
    const response = await fetch('/api/auth/shared-pin', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin,next})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to unlock workspace.');
    window.location.assign(data.redirect);
  }), []);
  return <div ref={host} style={{minHeight:'100vh',background:'#03060b'}} />;
}
