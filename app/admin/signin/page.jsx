'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const next = new URLSearchParams(window.location.search).get('next') || '/admin';

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totp, next }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.mfaRequired) setMfaRequired(true);
        setError(data.error || 'Sign-in failed.');
        return;
      }
      // The session is an httpOnly cookie now — nothing to store client-side.
      router.replace(data.redirect || '/admin');
      router.refresh();
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-auth-wrap">
      <div className="pb-card pb-auth-card">
        <div className="pb-card-body p-4">
          <div className="text-center mb-4">
            <span className="pb-brand-mark mx-auto mb-2" style={{ width: 44, height: 44 }}>▶</span>
            <h1 className="h5 mb-0" style={{ color: 'var(--bs-emphasis-color)' }}>PlayBeat Digital Admin</h1>
            <small style={{ color: 'var(--bs-secondary-color)' }}>Restricted — authorized administrators only</small>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Admin email</label>
              <input id="email" type="email" className="form-control" required autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@playbeat.digital" />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="pw">Password</label>
              <input id="pw" type="password" className="form-control" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" />
            </div>

            {mfaRequired && (
              <div className="mb-3">
                <label className="form-label" htmlFor="totp">Authenticator code</label>
                <input id="totp" className="form-control pb-mono" inputMode="numeric" maxLength={6}
                  autoComplete="one-time-code" value={totp}
                  onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456" />
              </div>
            )}

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Signing in…' : mfaRequired ? 'Verify code' : 'Sign in to dashboard'}
            </button>
          </form>

          <div className="alert alert-secondary small mt-3 mb-0">
            Sessions are served by an httpOnly, Secure, SameSite cookie with
            server-side expiry, idle timeout and immediate revocation. Storefront
            accounts (<Link href="/signin">/signin</Link>) are a separate identity
            domain and never grant admin access (README §8.1).
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
