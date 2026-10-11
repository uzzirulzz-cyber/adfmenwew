'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { APPS, APP_COLORS } from '../lib/apps';
import { NOTIFICATIONS, CUSTOMERS, ORDERS, LEADS } from '../lib/data';
import { useSession } from './SessionProvider';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ href: '/admin', icon: '▦', label: 'Dashboard' }],
  },
  {
    label: 'Applications',
    items: [
      ...APPS.map((a) => ({
        href: `/admin/apps/${a.slug}`,
        icon: '●',
        label: a.name,
        slug: a.slug,
      })),
      { href: '/admin/apps', icon: '✚', label: 'App Registry' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/admin/products', icon: '◈', label: 'Products & Licenses' },
      { href: '/admin/orders', icon: '⇄', label: 'Orders & Payments' },
      { href: '/admin/customers', icon: '☰', label: 'Customers & CRM' },
      { href: '/admin/live', icon: '▶', label: 'Live TV & Playlists' },
      { href: '/admin/sports', icon: '◉', label: 'Sports & Broadcast' },
      { href: '/admin/deals', icon: '◇', label: 'Deals & Listings' },
      { href: '/admin/reports', icon: '⭳', label: 'Reports & Exports' },
      { href: '/admin/staff', icon: '⚷', label: 'Staff, Roles & Audit' },
      { href: '/admin/settings', icon: '⚙', label: 'Settings & Health' },
    ],
  },
];

function Brand() {
  return (
    <Link href="/admin" className="pb-brand">
      <span className="pb-brand-mark">▶</span>
      <span>
        <strong style={{ fontSize: '.98rem', letterSpacing: '.01em' }}>PlayBeat Digital</strong>
        <small>Central Administration</small>
      </span>
    </Link>
  );
}

function SidebarNav({ liveStatuses, onNavigate }) {
  const pathname = usePathname();
  return (
    <nav className="pb-sidebar-body" aria-label="Admin navigation">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <div className="pb-nav-section">{section.label}</div>
          {section.items.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            // Live status drives the dot when we have it; the registry value is
            // only a fallback so a stale dot is never presented as live truth.
            const dot = item.slug ? (liveStatuses?.[item.slug]?.status || 'pending') : null;
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}
                className={`pb-navlink ${active ? 'active' : ''}`}>
                <span className="pb-ico">{item.icon}</span>
                <span className="text-truncate">{item.label}</span>
                {item.slug && <span className={`pb-appdot ${dot}`} title={`Status: ${dot}`} />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segs = pathname.split('/').filter(Boolean);
  const crumbs = segs.map((s, i) => ({
    label: s === 'admin' ? 'Dashboard' : decodeURIComponent(s).replace(/-/g, ' '),
    href: '/' + segs.slice(0, i + 1).join('/'),
  }));
  return (
    <nav className="pb-crumb d-none d-md-block" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c.href}>
          {i > 0 && <span className="mx-1">/</span>}
          {i === crumbs.length - 1 ? (
            <span style={{ color: 'var(--bs-emphasis-color)', textTransform: 'capitalize' }}>{c.label}</span>
          ) : (
            <Link href={c.href} style={{ textTransform: 'capitalize' }}>{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    const out = [];
    CUSTOMERS.filter((c) => c.name.toLowerCase().includes(needle) || c.email.includes(needle))
      .slice(0, 3).forEach((c) => out.push({ label: c.name, meta: `Customer · ${c.sourceId}`, href: '/admin/customers' }));
    ORDERS.filter((o) => o.orderNo.toLowerCase().includes(needle))
      .slice(0, 3).forEach((o) => out.push({ label: o.orderNo, meta: `Order · ${fmtShort(o)}`, href: '/admin/orders' }));
    LEADS.filter((l) => l.name.toLowerCase().includes(needle))
      .slice(0, 2).forEach((l) => out.push({ label: l.name, meta: `Lead · ${l.stage}`, href: '/admin/customers' }));
    APPS.filter((a) => a.name.toLowerCase().includes(needle))
      .slice(0, 2).forEach((a) => out.push({ label: a.name, meta: 'Application', href: `/admin/apps/${a.slug}` }));
    return out.slice(0, 8);
  }, [q]);

  return (
    <div className="position-relative flex-grow-1" style={{ maxWidth: 420 }}>
      <input
        className="form-control form-control-sm"
        placeholder="Search customers, orders, apps…"
        value={q}
        aria-label="Global search"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div className="dropdown-menu show mt-1 w-100" role="listbox">
          {results.map((r, i) => (
            <button key={i} className="dropdown-item d-flex justify-content-between gap-3"
              onMouseDown={() => { router.push(r.href); setQ(''); }}>
              <span>{r.label}</span>
              <small style={{ color: 'var(--bs-secondary-color)' }}>{r.meta}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
const fmtShort = (o) => `${o.currency} ${o.amount.toLocaleString()}`;

function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const saved = localStorage.getItem('pb_theme') || 'dark';
    setTheme(saved);
    document.documentElement.dataset.bsTheme = saved;
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.bsTheme = next;
    localStorage.setItem('pb_theme', next);
  };
  return (
    <button className="btn btn-sm btn-outline-secondary" onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, status, signOut, api } = useSession();
  const [liveStatuses, setLiveStatuses] = useState(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    // Bootstrap JS is needed for the off-canvas sidebar and dropdowns.
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  // The security boundary is the middleware plus the Route Handlers; this
  // redirect is only so an unauthenticated tab does not sit on a blank shell.
  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(`/admin/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // Real connector statuses (server-checked), not the static registry values.
  useEffect(() => {
    if (status !== 'ready' || bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      const out = {};
      for (const app of APPS) {
        const res = await api(`/api/connectors/${app.slug}`);
        if (res?.ok || res?.app) {
          out[app.slug] = res.status?.status ? res.status : { status: res.status };
        }
      }
      const wa = await api('/api/connectors/whatsapp');
      if (wa?.status) out.whatsapp = { status: wa.status };
      setLiveStatuses(out);
    })();
  }, [status, api]);

  if (status === 'loading' || status === 'anonymous') {
    return (
      <div className="pb-auth-wrap">
        <div className="text-center" style={{ color: 'var(--bs-secondary-color)' }}>
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Checking admin session…
        </div>
      </div>
    );
  }

  const initials = (session?.user?.email || '??').slice(0, 2).toUpperCase();
  const connected = APPS.filter((a) => (liveStatuses?.[a.slug]?.status || 'pending') === 'connected').length;

  return (
    <div className="d-flex">
      {/* Desktop sidebar */}
      <aside className="pb-sidebar d-none d-lg-flex">
        <Brand />
        <SidebarNav liveStatuses={liveStatuses} />
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,.06)', fontSize: '.75rem', color: '#63718a' }}>
          {connected}/{APPS.length} apps connected · session cookie
        </div>
      </aside>

      {/* Mobile off-canvas sidebar */}
      <div className="offcanvas offcanvas-start pb-offcanvas" tabIndex="-1" id="pbOffcanvas" aria-label="Mobile navigation">
        <div className="offcanvas-header p-0">
          <Brand />
          <button type="button" className="btn-close btn-close-white me-3" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <SidebarNav liveStatuses={liveStatuses} onNavigate={() => document.querySelector('#pbOffcanvas .btn-close')?.click()} />
      </div>

      <div className="pb-main">
        <header className="pb-topbar">
          <button className="btn btn-sm btn-outline-secondary d-lg-none" data-bs-toggle="offcanvas"
            data-bs-target="#pbOffcanvas" aria-label="Open navigation">☰</button>
          <Breadcrumbs />
          <GlobalSearch />

          {/* App switcher */}
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              Apps
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><h6 className="dropdown-header">Switch application</h6></li>
              {APPS.map((a) => (
                <li key={a.slug}>
                  <Link className="dropdown-item d-flex align-items-center gap-2" href={`/admin/apps/${a.slug}`}>
                    <span className="dot" style={{ width: 8, height: 8, borderRadius: '50%', background: APP_COLORS[a.slug] }} />
                    {a.name}
                    <span className={`pb-appdot ${liveStatuses?.[a.slug]?.status || 'pending'} ms-auto`} />
                  </Link>
                </li>
              ))}
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" href="/admin/apps">✚ App Registry…</Link></li>
            </ul>
          </div>

          {/* Notifications */}
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary position-relative" data-bs-toggle="dropdown" aria-label="Notifications">
              🔔
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
                {NOTIFICATIONS.length}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><h6 className="dropdown-header">Notifications</h6></li>
              {NOTIFICATIONS.map((n) => (
                <li key={n.id}>
                  <span className="dropdown-item pb-notif-item d-flex gap-2">
                    <span>{n.tone === 'warning' ? '⚠️' : n.tone === 'success' ? '✅' : 'ℹ️'}</span>
                    <span className="flex-grow-1">{n.text}
                      <br /><small style={{ color: 'var(--bs-secondary-color)' }}>{n.time} UTC</small></span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <ThemeToggle />

          {/* Account — role and scope come from the server session */}
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              {initials}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><h6 className="dropdown-header">
                {session?.user?.email}
                <br /><small className="fw-normal">{session?.user?.role}</small>
              </h6></li>
              <li><Link className="dropdown-item" href="/admin/staff">My role & permissions</Link></li>
              <li><Link className="dropdown-item" href="/admin/settings">Settings</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={signOut}>Sign out</button></li>
            </ul>
          </div>
        </header>

        <main className="pb-content">{children}</main>
      </div>
    </div>
  );
}
