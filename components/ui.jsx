'use client';

import { useState } from 'react';
import { APP_COLORS, APPS } from '../lib/apps';

/* ---------- Formatting helpers ---------- */
export function fmtMoney(amount, currency = 'PKR') {
  const n = Number(amount || 0).toLocaleString('en-US');
  return currency === 'PKR' ? `PKR ${n}` : `${currency} ${n}`;
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

/* ---------- Page header with breadcrumbs ---------- */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h4 mb-1" style={{ color: 'var(--bs-emphasis-color)' }}>{title}</h1>
        {subtitle && <p className="mb-0" style={{ color: 'var(--bs-secondary-color)', fontSize: '.9rem' }}>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ label, value, sub, tone }) {
  return (
    <div className="pb-card h-100">
      <div className="pb-card-body py-3">
        <div className="pb-stat-label">{label}</div>
        <div className="pb-stat-value my-1" style={tone ? { color: tone } : undefined}>{value}</div>
        {sub && <div className="pb-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Status badge ---------- */
const STATUS_MAP = {
  connected: ['success', 'Connected'],
  degraded: ['warning', 'Degraded'],
  pending: ['secondary', 'Not configured'],
  disconnected: ['danger', 'Disconnected'],
  live: ['danger', 'LIVE'],
  healthy: ['success', 'Healthy'],
  ready: ['success', 'Ready'],
  offline: ['secondary', 'Offline'],
  active: ['success', 'Active'],
  archived: ['secondary', 'Archived'],
  paid: ['success', 'Paid'],
  pending_payment: ['warning', 'Pending'],
  refunded: ['secondary', 'Refunded'],
  success: ['success', 'Success'],
  warning: ['warning', 'Warning'],
  verified: ['success', 'Verified'],
};

export function StatusBadge({ status, label }) {
  const [variant, text] = STATUS_MAP[status] || ['secondary', status];
  return <span className={`badge text-bg-${variant}`}>{label || text}</span>;
}

/* ---------- Source application badge ---------- */
export function SourceBadge({ slug }) {
  const app = APPS.find((a) => a.slug === slug);
  if (!app) return null;
  const c = APP_COLORS[slug] || '#4c8dff';
  return (
    <span className="pb-src" style={{ color: c, borderColor: `${c}55`, background: `${c}14` }}>
      <span className="dot" style={{ background: c }} />
      {app.short}
    </span>
  );
}

/* ---------- Generic data table with pagination ---------- */
export function DataTable({ columns, rows, pageSize = 8, empty }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const view = rows.slice(page * pageSize, page * pageSize + pageSize);

  if (!rows.length) {
    return <EmptyState title={empty?.title || 'Nothing here yet'} body={empty?.body} />;
  }

  return (
    <div>
      <div className="pb-table-wrap">
        <table className="table table-hover align-middle">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {view.map((row, i) => (
              <tr key={row.id || row.sku || i}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderTop: '1px solid var(--pb-line)' }}>
          <small style={{ color: 'var(--bs-secondary-color)' }}>
            Page {page + 1} of {pages} · {rows.length} records
          </small>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>‹ Prev</button>
            <button className="btn btn-outline-secondary" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next ›</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Card wrapper ---------- */
export function Panel({ title, actions, children, pad = true }) {
  return (
    <div className="pb-card h-100">
      {title && (
        <div className="pb-card-head">
          <strong style={{ color: 'var(--bs-emphasis-color)', fontSize: '.95rem' }}>{title}</strong>
          {actions}
        </div>
      )}
      {pad ? <div className="pb-card-body">{children}</div> : children}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = '◌', title, body }) {
  return (
    <div className="pb-empty">
      <span className="ico">{icon}</span>
      <div style={{ color: 'var(--bs-emphasis-color)', fontWeight: 600 }}>{title}</div>
      {body && <div className="mt-1" style={{ fontSize: '.88rem' }}>{body}</div>}
    </div>
  );
}

/* ---------- Lightweight bar chart (CSS-based, no deps) ---------- */
export function BarChart({ data, format = (v) => v }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="pb-bars">
      {data.map((d) => (
        <div className="pb-bar-col" key={d.label}>
          <span className="pb-bar-value">{format(d.value)}</span>
          <div
            className="pb-bar"
            style={{ height: `${Math.max(4, Math.round((d.value / max) * 100))}%`, background: d.color ? `linear-gradient(180deg, ${d.color}, ${d.color}99)` : undefined }}
            title={`${d.label}: ${format(d.value)}`}
          />
          <span className="pb-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- CSV export (works fully client-side) ---------- */
export function ExportCSVButton({ filename, columns, rows, label = 'Export CSV' }) {
  const download = () => {
    const esc = (v) => JSON.stringify(v ?? '');
    const csv = [
      columns.map((c) => esc(c.label)).join(','),
      ...rows.map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <button type="button" className="btn btn-sm btn-outline-primary" onClick={download}>
      ⭳ {label}
    </button>
  );
}

