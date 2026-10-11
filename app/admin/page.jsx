'use client';

import Link from 'next/link';
import { APPS, APP_COLORS } from '../../lib/apps';
import { ORDERS, CHANNELS, DEALS, AUDIT, CUSTOMERS } from '../../lib/data';
import { PageHeader, StatCard, StatusBadge, SourceBadge, Panel, BarChart, DataTable, fmtMoney, fmtDateTime } from '../../components/ui';
import DataSourceBanner from '../../components/DataSourceBanner';
import { useSession } from '../../components/SessionProvider';
import { useEffect, useState } from 'react';

export default function Overview() {
  const { api } = useSession();
  const [mode, setMode] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await api('/api/health');
      if (res?.mode) setMode(res.mode);
    })();
  }, [api]);

  // PKR is the reporting currency. USD amounts are kept separate and labeled —
  // never blended into PKR totals, and each payment is counted once, keyed by
  // (app, source order number) so cross-app sync cannot double-count.
  const paidPKR = ORDERS.filter((o) => o.status === 'paid' && o.currency === 'PKR');
  const paidUSD = ORDERS.filter((o) => o.status === 'paid' && o.currency === 'USD');
  const revenuePKR = paidPKR.reduce((s, o) => s + o.amount, 0);
  const revenueUSD = paidUSD.reduce((s, o) => s + o.amount, 0);
  const viewers = CHANNELS.reduce((s, c) => s + c.viewers, 0);
  const openEnquiries = DEALS.filter((d) => d.status !== 'closed').reduce((s, d) => s + d.enquiries, 0);

  const byApp = APPS.map((a) => ({
    label: a.short,
    color: APP_COLORS[a.slug],
    value: paidPKR.filter((o) => o.app === a.slug).reduce((s, o) => s + o.amount, 0),
  }));

  return (
    <>
      <PageHeader
        title="All Applications — Overview"
        subtitle="Combined, source-traceable view across the PlayBeat Digital ecosystem. Every figure keeps its source application and original record id."
        actions={<Link href="/admin/apps" className="btn btn-sm btn-primary">✚ Add Application</Link>}
      />

      {mode && <DataSourceBanner mode={mode} />}

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3"><StatCard label="Revenue (paid, PKR)" value={fmtMoney(revenuePKR)} sub={`+ ${fmtMoney(revenueUSD, 'USD')} held in USD — reported separately`} /></div>
        <div className="col-6 col-xl-3"><StatCard label="Paid orders" value={paidPKR.length + paidUSD.length} sub={`${ORDERS.filter((o) => o.status === 'pending').length} awaiting payment review`} /></div>
        <div className="col-6 col-xl-3"><StatCard label="Live viewers now" value={viewers.toLocaleString()} sub={`${CHANNELS.filter((c) => c.status === 'live').length} channels broadcasting`} /></div>
        <div className="col-6 col-xl-3"><StatCard label="Open enquiries" value={openEnquiries} sub="MakeThisDeal.biz active listings" /></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <Panel title="Revenue by application (PKR, paid only)">
            <BarChart data={byApp} format={(v) => (v ? `${Math.round(v / 1000)}k` : '0')} />
            <small style={{ color: 'var(--bs-secondary-color)' }}>
              Pulse CRM contributes no direct revenue; MagXTV monetization is disabled in this build.
            </small>
          </Panel>
        </div>
        <div className="col-lg-5">
          <Panel title="Connection status" pad={false}>
            <div className="pb-table-wrap">
              <table className="table align-middle">
                <thead><tr><th>Application</th><th>Status</th><th>Last sync (UTC)</th></tr></thead>
                <tbody>
                  {APPS.map((a) => (
                    <tr key={a.slug}>
                      <td>
                        <Link href={`/admin/apps/${a.slug}`} className="d-flex align-items-center gap-2" style={{ color: 'var(--bs-emphasis-color)' }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: APP_COLORS[a.slug] }} />
                          {a.name}
                        </Link>
                      </td>
                      <td><StatusBadge status={a.status} /></td>
                      <td><small className="pb-mono">{fmtDateTime(a.lastSync)}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <Panel title="Recent orders — all sources" pad={false}
            actions={<Link href="/admin/orders" className="btn btn-sm btn-outline-secondary">View all</Link>}>
            <DataTable
              pageSize={5}
              columns={[
                { key: 'orderNo', label: 'Order', render: (r) => <span className="pb-mono">{r.orderNo}</span> },
                { key: 'app', label: 'Source', render: (r) => <SourceBadge slug={r.app} /> },
                { key: 'customer', label: 'Customer' },
                { key: 'amount', label: 'Amount', render: (r) => fmtMoney(r.amount, r.currency) },
                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
              ]}
              rows={ORDERS}
            />
          </Panel>
        </div>
        <div className="col-lg-5">
          <Panel title="Recent activity" pad={false}>
            <ul className="list-group list-group-flush" style={{ background: 'transparent' }}>
              {AUDIT.slice(0, 5).map((a, i) => (
                <li key={i} className="list-group-item d-flex gap-2" style={{ background: 'transparent', borderColor: 'var(--pb-line)', color: 'var(--bs-body-color)' }}>
                  <span>{a.result === 'success' ? '✅' : '⚠️'}</span>
                  <div>
                    <div style={{ fontSize: '.87rem' }}>{a.action} — <span style={{ color: 'var(--bs-emphasis-color)' }}>{a.target}</span></div>
                    <small style={{ color: 'var(--bs-secondary-color)' }}>{a.time} UTC · {a.actor}</small>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
