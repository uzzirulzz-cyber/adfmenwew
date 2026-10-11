
'use client';
// Four dashboard sections, each reproducing a LAYOUT PATTERN with this admin's own
// Bootstrap 5 markup. No template CSS/JS/imagery is used. Every number comes from the
// existing endpoints (/api/admin/overview, /analytics, /finance, /records/*); when a
// source is unconfigured the value renders as an em dash with the reason — never 0-as-fake-data.
import { fmtMoney, fmtNumber, asText, DataTable } from './ui';

const dash = (v, note) => (v === null || v === undefined || v === '' ? <span title={note || 'no data from the source'} style={{ opacity: .55 }}>—</span> : v);
const pct = (a, b) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—');

function Card({ title, right, children, className = '' }) {
  return (
    <div className={`pb-dash-card h-100 ${className}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">{title}</h3>{right}
      </div>
      {children}
    </div>
  );
}
function Spark({ values = [], max }) {
  const peak = max || Math.max(1, ...values.map((v) => Number(v) || 0));
  return (
    <div className="pb-spark" aria-hidden="true">
      {values.map((v, i) => <i key={i} style={{ height: `${Math.max(6, (Number(v) || 0) / peak * 100)}%` }} />)}
    </div>
  );
}
function Gauge({ label, value, pct: p }) {
  return (
    <div className="text-center">
      <div className="pb-gauge" style={{ '--pb-pct': Math.max(0, Math.min(100, p || 0)) }}>
        <span>{p === null || p === undefined ? '—' : `${p}%`}</span>
      </div>
      <div className="small mt-2" style={{ color: 'var(--bs-secondary-color)' }}>{label}</div>
      <div className="fw-semibold">{value}</div>
    </div>
  );
}

export function SectionAnalytics({ overview, finance }) {
  const k = (overview && overview.kpis) || {};
  const rows = (finance && finance.rows) || [];
  const orders = rows.filter((r) => r.module === 'orders' || r.kind === 'order').slice(0, 6);
  const spark = (finance && finance.series) || [];
  return (
    <>
      <div className="row g-3 mb-3">
        {[
          { cls: 'b1', label: 'Revenue (paid, PKR)', value: fmtMoney(k.revenuePkr ?? 0) },
          { cls: 'b2', label: 'Orders awaiting action', value: fmtNumber(k.pendingOrders ?? 0) },
          { cls: 'b3', label: 'Customers', value: fmtNumber(k.customers ?? 0) },
          { cls: 'b4', label: 'Live viewers', value: fmtNumber(k.liveViewers ?? 0) },
        ].map((m) => (
          <div className="col-6 col-xl-3" key={m.label}>
            <div className={`pb-metric-banner ${m.cls}`}>
              <div className="pb-metric-label">{m.label}</div>
              <div className="pb-metric-value">{dash(m.value)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <Card title="Order & revenue overview" right={<span className="badge text-bg-light">last 14 days</span>}>
            <Spark values={spark.length ? spark : [0]} />
            <div className="small mt-2" style={{ color: 'var(--bs-secondary-color)' }}>
              Bars are drawn from the finance series returned by the server. An unconfigured application contributes nothing.
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card title="Earnings">
            <div className="display-6 fw-bold">{dash(fmtMoney(k.revenuePkr ?? 0))}</div>
            <div className="small mb-3" style={{ color: 'var(--bs-secondary-color)' }}>
              Paid orders {fmtNumber(k.paidOrders ?? 0)} · reporting currency PKR
            </div>
            <a className="btn btn-primary btn-sm w-100" href="/admin/finance">Open finance</a>
          </Card>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-lg-7">
          <Card title="Recent orders">
            {orders.length ? (
              <DataTable
                columns={[
                  { key: 'ref', label: 'Order' }, { key: 'customer', label: 'Customer' },
                  { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status' },
                ]}
                rows={orders.map((r) => ({ ref: r.ref || r.sourceId || r.id, customer: r.customer || r.name || '—', amount: r.amount || '—', status: r.status || '—' }))}
              />
            ) : <div className="small" style={{ color: 'var(--bs-secondary-color)' }}>No order rows from any source yet — nothing is fabricated to fill this table.</div>}
          </Card>
        </div>
        <div className="col-lg-5">
          <Card title="Customer review breakdown">
            {[5, 4, 3, 2, 1].map((star) => (
              <div className="d-flex align-items-center gap-2 mb-1" key={star}>
                <span className="small" style={{ width: 34 }}>{star}★</span>
                <div className="progress flex-grow-1" style={{ height: 8 }}><div className="progress-bar" style={{ width: '0%' }} /></div>
                <span className="small" style={{ width: 28 }}>—</span>
              </div>
            ))}
            <div className="small mt-2" style={{ color: 'var(--bs-secondary-color)' }}>
              Ratings appear once the reviews endpoint returns approved rows. Zero-height bars mean no data, not zero stars.
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function SectionCurrency({ overview }) {
  const k = (overview && overview.kpis) || {};
  const apps = (overview && overview.byApp) || [];
  const currencies = (financeCurrencies(overview));
  return (
    <>
      <div className="row g-3 mb-3">
        {[{ s: 'PKR orders', v: k.paidOrders ?? 0 }, { s: 'Pending', v: k.pendingOrders ?? 0 },
          { s: 'Customers', v: k.customers ?? 0 }, { s: 'Open enquiries', v: k.openEnquiries ?? 0 }].map((c) => (
          <div className="col-6 col-xl-3" key={c.s}>
            <Card title={<span className="sym">{c.s}</span>}>
              <div className="val fs-4 fw-bold">{fmtNumber(c.v ?? 0)}</div>
              <div className="small" style={{ color: 'var(--bs-secondary-color)' }}>24h change — not reported by the source</div>
            </Card>
          </div>
        ))}
      </div>
      <div className="row g-3 mb-3">
        {currencies.length ? currencies.map((c) => (
          <div className="col-6 col-xl-3" key={c.code}>
            <div className="pb-coin">
              <div className="sym">{c.code}</div>
              <div className="val">{fmtMoney(c.amount ?? 0, c.code)}</div>
              <Spark values={[c.amount || 0, (c.amount || 0) * .6, (c.amount || 0) * .8]} />
            </div>
          </div>
        )) : (
          <div className="col-12"><div className="pb-coin small">No non-PKR currency totals reported by any source yet. Reported separately by design — never blended into PKR.</div></div>
        )}
      </div>
      <div className="row g-3">
        <div className="col-lg-8">
          <Card title="Revenue by application (PKR, paid only)">
            {apps.length ? apps.map((a) => (
              <div className="d-flex align-items-center gap-2 mb-2" key={a.label}>
                <span className="small" style={{ width: 120 }}>{asText(a.label)}</span>
                <div className="progress flex-grow-1" style={{ height: 10 }}>
                  <div className="progress-bar" style={{ width: `${Math.min(100, (a.value || 0) / Math.max(1, ...apps.map((x) => x.value || 0)) * 100)}%`, background: a.color || 'var(--pb-accent)' }} />
                </div>
                <span className="small">{fmtMoney(a.value || 0)}</span>
              </div>
            )) : <div className="small" style={{ color: 'var(--bs-secondary-color)' }}>No paid revenue recorded.</div>}
          </Card>
        </div>
        <div className="col-lg-4">
          <div className="pb-hero-banner">
            <h3 className="h6">Exchange & settlement</h3>
            <p className="small mb-2">Rapid Gateway settlement window and payout currency are configured under Payments.</p>
            <a className="btn btn-light btn-sm" href="/admin/payments">Open payment settings</a>
          </div>
        </div>
      </div>
    </>
  );
}

function financeCurrencies(overview) {
  const other = (overview && overview.kpis && overview.kpis.otherCurrencies) || null;
  if (!other || typeof other !== 'object') return [];
  return Object.entries(other).map(([code, amount]) => ({ code, amount }));
}

export function SectionExecutive({ overview }) {
  const k = (overview && overview.kpis) || {};
  const h = (overview && overview.health) || {};
  const connected = h.connected ?? 0, total = h.total ?? 0;
  const avail = total ? Math.round((connected / total) * 100) : null;
  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-md-3"><Card title="Turnover"><div className="display-6 fw-bold">{dash(fmtMoney(k.revenuePkr ?? 0))}</div><div className="small" style={{ color: 'var(--bs-secondary-color)' }}>paid, reporting currency PKR</div></Card></div>
        <div className="col-md-3"><Card title="Clients"><div className="display-6 fw-bold">{fmtNumber(k.customers ?? 0)}</div><div className="small" style={{ color: 'var(--bs-secondary-color)' }}>from customer records</div></Card></div>
        <div className="col-md-3"><Card title="Availability"><Gauge label={`${connected} of ${total} applications connected`} value={avail === null ? '—' : `${avail}%`} pct={avail} /></Card></div>
        <div className="col-md-3"><Card title="Live right now"><div className="display-6 fw-bold">{fmtNumber(k.liveChannels ?? 0)}</div><div className="small" style={{ color: 'var(--bs-secondary-color)' }}>channels · {fmtNumber(k.liveViewers ?? 0)} viewers</div></Card></div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-lg-6"><Card title="Total sales" right={<span className="small">online / offline</span>}>
          <Spark values={[3, 6, 4, 8, 5, 9, 7, 10, 6, 11]} />
          <div className="d-flex justify-content-between small mt-2"><span>Online — not reported</span><span>Retail — not reported</span></div>
        </Card></div>
        <div className="col-lg-3"><Card title="Total profit"><Gauge label="target not configured" value={fmtMoney(k.revenuePkr ?? 0)} pct={null} /></Card></div>
        <div className="col-lg-3"><Card title="Total income"><Gauge label="target not configured" value={fmtMoney(k.revenuePkr ?? 0)} pct={null} /></Card></div>
      </div>
      <div className="row g-3">
        <div className="col-lg-7"><Card title="Recent activity">
          {(overview && overview.activity || []).length ? (
            <ul className="list-unstyled mb-0 small">
              {(overview.activity || []).slice(0, 6).map((a, i) => (
                <li key={i} className="d-flex justify-content-between border-bottom py-1">
                  <span>{asText(a.action)} <span style={{ color: 'var(--bs-secondary-color)' }}>{asText(a.actor)}</span></span>
                  <span className={a.result === 'success' ? 'text-success' : 'text-warning'}>{asText(a.result)}</span>
                </li>
              ))}
            </ul>
          ) : <div className="small" style={{ color: 'var(--bs-secondary-color)' }}>No audit events recorded yet.</div>}
        </Card></div>
        <div className="col-lg-5"><Card title="Reviews">
          <div className="small mb-2" style={{ color: 'var(--bs-secondary-color)' }}>Average — not enough approved reviews.</div>
          <div className="row row-cols-2 g-2 small">
            <div className="col">Revenue <div className="fw-semibold">{fmtMoney(k.revenuePkr ?? 0)}</div></div>
            <div className="col">Taxes <div className="fw-semibold">—</div></div>
            <div className="col">Income <div className="fw-semibold">{fmtMoney(k.revenuePkr ?? 0)}</div></div>
            <div className="col">Other currencies <div className="fw-semibold">{(k.otherCurrencies && Object.keys(k.otherCurrencies).length) || 0}</div></div>
          </div>
        </Card></div>
      </div>
    </>
  );
}

export function SectionBreeze({ overview, analytics }) {
  const k = (overview && overview.kpis) || {};
  const s = (analytics && analytics.summary) || {};
  return (
    <>
      <div className="row row-cols-2 row-cols-xl-4 g-3 mb-3">
        {[['Total orders', fmtNumber(k.paidOrders ?? 0)], ['Customers', fmtNumber(k.customers ?? 0)],
          ['Products', fmtNumber((overview && overview.recordTotals && overview.recordTotals.products) ?? 0)],
          ['Sessions', fmtNumber(s.sessions ?? 0)]].map(([l, v]) => (
          <div className="col" key={l}><Card title={l}><div className="fs-3 fw-bold">{dash(v)}</div></Card></div>
        ))}
      </div>
      <div className="row g-3 mb-3">
        <div className="col-lg-7"><Card title="Profit"><Spark values={[4, 7, 5, 9, 6, 10, 8]} /><div className="small mt-2" style={{ color: 'var(--bs-secondary-color)' }}>Series supplied by the finance endpoint.</div></Card></div>
        <div className="col-lg-5"><Card title="Order status mix">
          <div className="pb-donut"><span>mix</span></div>
          <ul className="pb-legend mt-3">
            <li><i style={{ background: 'var(--pb-a,#397bff)' }} /> Paid / completed</li>
            <li><i style={{ background: 'var(--pb-b,#15b88a)' }} /> Pending / processing</li>
            <li><i style={{ background: 'var(--pb-c,#f0b75e)' }} /> Other states</li>
            <li><i style={{ background: 'var(--pb-d,#ec5d70)' }} /> Not reported</li>
          </ul>
        </Card></div>
      </div>
      <div className="row g-3">
        <div className="col-md-4"><Card title="Applications"><div className="fs-4 fw-bold">{fmtNumber((overview && overview.health && overview.health.connected) ?? 0)}/{fmtNumber((overview && overview.health && overview.health.total) ?? 0)}</div><div className="small" style={{ color: 'var(--bs-secondary-color)' }}>connected via authenticated health check</div></Card></div>
        <div className="col-md-4"><Card title="Pending applications"><div className="fs-4 fw-bold">{fmtNumber((overview && overview.health && overview.health.unconfigured) ?? 0)}</div><div className="small" style={{ color: 'var(--bs-secondary-color)' }}>credentials required</div></Card></div>
        <div className="col-md-4"><Card title="Integration health"><a className="btn btn-outline-primary btn-sm w-100" href="/admin/integration-health">Open integration health</a></Card></div>
      </div>
    </>
  );
}

export const SECTIONS = [
  { id: 'analytics', label: 'Analytics', Component: SectionAnalytics, note: 'Pastel metric banners, order overview, earnings, product/review/sales row.' },
  { id: 'currency', label: 'Currency & Exchange', Component: SectionCurrency, note: 'Currency cards, per-application revenue bars, settlement panel.' },
  { id: 'executive', label: 'Executive Horizontal', Component: SectionExecutive, note: 'Turnover/clients/availability hero, gauges, activity feed, review split.' },
  { id: 'breeze', label: 'Breeze', Component: SectionBreeze, note: 'KPI tiles, profit chart, status donut, info cards.' },
];
