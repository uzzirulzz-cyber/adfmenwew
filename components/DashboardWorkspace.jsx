'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { APPS, APP_COLORS } from '../lib/apps';
import { ORDERS, CHANNELS, DEALS, AUDIT } from '../lib/data';
import { PageHeader, StatCard, StatusBadge, SourceBadge, Panel, BarChart, DataTable, fmtMoney, fmtDateTime } from './ui';
import DataSourceBanner from './DataSourceBanner';
import { useSession } from './SessionProvider';

const WIDGETS = [
  { id: 'kpis', label: 'Revenue, orders, viewers and enquiries' },
  { id: 'revenue', label: 'Revenue by application' },
  { id: 'connections', label: 'Application health' },
  { id: 'live', label: 'PlayBeat Live workspace' },
  { id: 'orders', label: 'Recent orders' },
  { id: 'activity', label: 'Recent activity' },
];
const DEFAULT_DASHBOARD = { hiddenWidgets: [], widgetOrder: WIDGETS.map((widget) => widget.id), widgetSizes: {}, refreshSeconds: 0 };

export default function DashboardWorkspace() {
  const { api, can } = useSession();
  const [mode, setMode] = useState(null);
  const [connectorStates, setConnectorStates] = useState([]);
  const [liveBridge, setLiveBridge] = useState(null);
  const [dashboard, setDashboard] = useState(DEFAULT_DASHBOARD);
  const [customizing, setCustomizing] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [health, config] = await Promise.all([api('/api/health'), api('/api/admin/config')]);
      if (!alive) return;
      if (health?.mode) setMode(health.mode);
      if (Array.isArray(health?.statuses)) setConnectorStates(health.statuses);
      if (config?.dashboard) setDashboard({ ...DEFAULT_DASHBOARD, ...config.dashboard });
    })();
    return () => { alive = false; };
  }, [api]);

  useEffect(() => {
    let alive = true;
    const refreshLive = async () => {
      if (document.visibilityState !== 'visible') return;
      const result = await api('/api/admin/playbeat-live');
      if (alive && result?.ok) setLiveBridge(result);
    };
    refreshLive();
    const timer = window.setInterval(refreshLive, 60_000);
    document.addEventListener('visibilitychange', refreshLive);
    return () => { alive = false; window.clearInterval(timer); document.removeEventListener('visibilitychange', refreshLive); };
  }, [api]);

  useEffect(() => {
    const seconds = Number(dashboard.refreshSeconds || 0);
    if (!seconds) return undefined;
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      const [health, bridge] = await Promise.all([api('/api/health'), api('/api/admin/playbeat-live')]);
      if (Array.isArray(health?.statuses)) setConnectorStates(health.statuses);
      if (bridge?.ok) setLiveBridge(bridge);
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [dashboard.refreshSeconds, api]);

  const saveDashboard = async () => {
    setBusy(true);
    const res = await api('/api/admin/config', { method: 'POST', body: { action: 'dashboard:save', dashboard } });
    setBusy(false);
    setMessage(res?.ok ? 'Your dashboard layout is saved to your account.' : (res?.error || 'Could not save dashboard settings.'));
  };
  const moveWidget = (id, delta) => setDashboard((current) => {
    const order = [...(current.widgetOrder || WIDGETS.map((widget) => widget.id))];
    const index = order.indexOf(id), nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return current;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    return { ...current, widgetOrder: order };
  });

  // PKR remains the reporting currency; USD is always labeled and shown separately.
  const paidPKR = ORDERS.filter((order) => order.status === 'paid' && order.currency === 'PKR');
  const paidUSD = ORDERS.filter((order) => order.status === 'paid' && order.currency === 'USD');
  const revenuePKR = paidPKR.reduce((sum, order) => sum + order.amount, 0);
  const revenueUSD = paidUSD.reduce((sum, order) => sum + order.amount, 0);
  const viewers = CHANNELS.reduce((sum, channel) => sum + channel.viewers, 0);
  const openEnquiries = DEALS.filter((deal) => deal.status !== 'closed').reduce((sum, deal) => sum + deal.enquiries, 0);
  const byApp = APPS.map((app) => ({ label: app.short, color: APP_COLORS[app.slug], value: paidPKR.filter((order) => order.app === app.slug).reduce((sum, order) => sum + order.amount, 0) }));
  const demoMode = mode === 'demo';
  const connectionFor = (slug) => connectorStates.find((item) => item.slug === slug);
  const unavailable = (label) => <Panel title={label}><p className="mb-0 small" style={{ color: 'var(--bs-secondary-color)' }}>No live report is connected for this section. Demo fixtures are hidden while connector mode is live.</p></Panel>;

  const content = {
    kpis: demoMode ? <div className="row g-3"><div className="col-6 col-xl-3"><StatCard label="Revenue (paid, PKR)" value={fmtMoney(revenuePKR)} sub={`+ ${fmtMoney(revenueUSD, 'USD')} held in USD`} /></div><div className="col-6 col-xl-3"><StatCard label="Paid orders" value={paidPKR.length + paidUSD.length} sub={`${ORDERS.filter((order) => order.status === 'pending').length} awaiting payment review`} /></div><div className="col-6 col-xl-3"><StatCard label="Live viewers now" value={viewers.toLocaleString()} sub={`${CHANNELS.filter((channel) => channel.status === 'live').length} channels broadcasting`} /></div><div className="col-6 col-xl-3"><StatCard label="Open enquiries" value={openEnquiries} sub="MakeThisDeal.biz active listings" /></div></div> : unavailable('Business overview'),
    revenue: demoMode ? <Panel title="Revenue by application · PKR, paid only"><BarChart data={byApp} format={(value) => (value ? `${Math.round(value / 1000)}k` : '0')} /><small style={{ color: 'var(--bs-secondary-color)' }}>USD is kept separate. Pulse CRM contributes no direct revenue; MagXTV monetization is disabled.</small></Panel> : unavailable('Revenue reports'),
    connections: <Panel title="Connection status" pad={false}><div className="pb-table-wrap"><table className="table align-middle"><thead><tr><th>Application</th><th>Status</th><th>Last sync · UTC</th></tr></thead><tbody>{APPS.map((app) => { const state = connectionFor(app.slug); return <tr key={app.slug}><td><Link href={`/admin/apps/${app.slug}`} className="d-flex align-items-center gap-2" style={{ color: 'var(--bs-emphasis-color)' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: APP_COLORS[app.slug] }} />{app.name}</Link></td><td><StatusBadge status={state?.status || 'pending'} /></td><td><small className="pb-mono">{fmtDateTime(state?.lastSync || null)}</small></td></tr>; })}</tbody></table></div></Panel>,
    live: <Panel title="PlayBeat Live · separate workspace" actions={<Link href="/admin/live" className="btn btn-sm btn-outline-secondary">Open Live workspace</Link>}><div className="d-flex justify-content-between align-items-center mb-2"><span className="small">Dashboard bridge</span><StatusBadge status={liveBridge?.source?.status || 'pending'} /></div><p className="small mb-1" style={{ color: 'var(--bs-secondary-color)' }}>{liveBridge?.source?.connected ? 'Bridge checked independently. Live traffic and audience metrics are still awaiting the Live event feed.' : (liveBridge?.source?.error || 'Bridge is not configured. Digital metrics are not used as a substitute.')}</p><small className="pb-mono" style={{ color: 'var(--bs-secondary-color)' }}>Last check · {fmtDateTime(liveBridge?.checkedAt || null)} UTC</small></Panel>,
    orders: demoMode ? <Panel title="Recent orders" pad={false} actions={<Link href="/admin/orders" className="btn btn-sm btn-outline-secondary">View all</Link>}><DataTable pageSize={5} columns={[{ key: 'orderNo', label: 'Order', render: (row) => <span className="pb-mono">{row.orderNo}</span> }, { key: 'app', label: 'Source', render: (row) => <SourceBadge slug={row.app} /> }, { key: 'customer', label: 'Customer' }, { key: 'amount', label: 'Amount', render: (row) => fmtMoney(row.amount, row.currency) }, { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }]} rows={ORDERS} /></Panel> : unavailable('Recent orders'),
    activity: demoMode ? <Panel title="Recent activity" pad={false}><ul className="list-group list-group-flush" style={{ background: 'transparent' }}>{AUDIT.slice(0, 5).map((entry, index) => <li key={index} className="list-group-item d-flex gap-2" style={{ background: 'transparent', borderColor: 'var(--pb-line)', color: 'var(--bs-body-color)' }}><span>{entry.result === 'success' ? '✓' : '!'}</span><div><div style={{ fontSize: '.87rem' }}>{entry.action} — <span style={{ color: 'var(--bs-emphasis-color)' }}>{entry.target}</span></div><small style={{ color: 'var(--bs-secondary-color)' }}>{entry.time} UTC · {entry.actor}</small></div></li>)}</ul></Panel> : unavailable('Recent activity'),
  };
  const order = dashboard.widgetOrder?.length ? dashboard.widgetOrder : WIDGETS.map((widget) => widget.id);

  return <>
    <PageHeader title="Central Command Center" subtitle="Business overview across PlayBeat Digital applications. Connector data is labeled and stays separate by source." actions={<><button className="btn btn-sm btn-outline-secondary" onClick={() => setCustomizing((value) => !value)}>{customizing ? 'Close editor' : 'Customize dashboard'}</button><Link href="/admin/apps" className="btn btn-sm btn-primary">＋ Applications</Link></>} />
    {mode && <DataSourceBanner mode={mode} statuses={connectorStates} />}
    {message && <div className="alert alert-secondary py-2 small" role="status">{message}</div>}
    {customizing && <div className="pb-card mb-3"><div className="pb-card-head"><strong>Personal dashboard layout</strong><span className="small">Changes are saved for your admin account</span></div><div className="pb-card-body"><div className="row g-3 align-items-end mb-3"><div className="col-sm-6 col-lg-4"><label className="form-label small">Refresh interval</label><select className="form-select form-select-sm" value={dashboard.refreshSeconds} onChange={(e) => setDashboard({ ...dashboard, refreshSeconds: Number(e.target.value) })}><option value="0">Manual</option><option value="60">Every minute</option><option value="300">Every 5 minutes</option><option value="900">Every 15 minutes</option></select></div><div className="col"><small style={{ color: 'var(--bs-secondary-color)' }}>Refresh reloads the dashboard route. It does not create new analytics or mark a disconnected source as live.</small></div><div className="col-auto"><button className="btn btn-sm btn-primary" disabled={busy} onClick={saveDashboard}>Save layout</button></div></div><div className="pb-widget-editor">{order.map((id, index) => { const widget = WIDGETS.find((item) => item.id === id); if (!widget) return null; return <div className="pb-widget-editor-row" key={id}><span className="pb-widget-grip" aria-hidden="true">⠿</span><strong className="small">{widget.label}</strong><select className="form-select form-select-sm" aria-label={`${widget.label} width`} value={(dashboard.widgetSizes || {})[id] || (id === 'kpis' ? '12' : '6')} onChange={(e) => setDashboard({ ...dashboard, widgetSizes: { ...(dashboard.widgetSizes || {}), [id]: e.target.value } })}><option value="4">One third</option><option value="6">Half width</option><option value="12">Full width</option></select><button className="btn btn-sm btn-outline-secondary" aria-label={`Move ${widget.label} up`} disabled={!index} onClick={() => moveWidget(id, -1)}>↑</button><button className="btn btn-sm btn-outline-secondary" aria-label={`Move ${widget.label} down`} disabled={index === order.length - 1} onClick={() => moveWidget(id, 1)}>↓</button><input className="form-check-input" type="checkbox" aria-label={`Show ${widget.label}`} checked={!(dashboard.hiddenWidgets || []).includes(id)} onChange={(e) => setDashboard({ ...dashboard, hiddenWidgets: e.target.checked ? (dashboard.hiddenWidgets || []).filter((item) => item !== id) : [...(dashboard.hiddenWidgets || []), id] })} /></div>; })}</div></div></div>}
    <div className="row g-3">
      {order.map((id) => {
        if ((dashboard.hiddenWidgets || []).includes(id) || !content[id]) return null;
        const size = (dashboard.widgetSizes || {})[id] || (id === 'kpis' ? '12' : '6');
        return <div key={id} className={`col-12 col-lg-${size}`} style={{ order: order.indexOf(id) }}>{content[id]}</div>;
      })}
    </div>
  </>;
}
