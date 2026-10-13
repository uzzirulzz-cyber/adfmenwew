'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '../../../components/SessionProvider';
import { PageHeader, Panel, StatCard, StatusBadge, EmptyState, fmtDateTime, fmtMoney, fmtNumber } from '../../../components/ui';

const tabs = ['Overview', 'Leads', 'Imports', 'Campaigns', 'Integrations', 'Compliance'];

export default function LeadEnginePage() {
  const { api, can } = useSession();
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [form, setForm] = useState({ name: '', segment: 'C', channel: 'WhatsApp', score: 80, status: 'verified', source: 'Ghostmap CSV' });
  const writable = can('marketing:write');

  const load = useCallback(async () => {
    const res = await api('/api/admin/lead-engine');
    if (res?.ok) setData(res);
    else setNotice({ tone: 'warning', text: res?.error || res?.reason || 'Lead engine data is unavailable.' });
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const saveLead = async (event) => {
    event.preventDefault();
    const payload = {
      action: 'save-lead',
      lead: {
        ...form,
        score: Number(form.score) || 0,
      },
    };
    const res = await api('/api/admin/lead-engine', { method: 'POST', body: payload });
    if (res?.ok) {
      setNotice({ tone: 'success', text: res.message || 'Lead saved.' });
      setForm({ name: '', segment: 'C', channel: 'WhatsApp', score: 80, status: 'verified', source: 'Ghostmap CSV' });
      load();
    } else {
      setNotice({ tone: 'danger', text: res?.error || 'The lead could not be saved.' });
    }
  };

  const stats = data?.stats || [];
  const funnel = data?.funnel || [];
  const leads = data?.leads || [];
  const campaigns = data?.campaigns || [];
  const sources = data?.sources || [];
  const segments = data?.segments || [];
  const channels = data?.channels || [];

  const progressLabel = useMemo(() => {
    if (!data) return '0%';
    return `${data.progressPct ?? 0}%`;
  }, [data]);

  return (
    <>
      <PageHeader
        title="Lead Engine"
        subtitle="AI-assisted acquisition, deduplication, verification and compliant outreach for global and Pakistan-priority campaigns."
        actions={
          <>
            <Link href="/admin/marketing" className="btn btn-sm btn-outline-secondary">Back to marketing</Link>
            {writable && <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('Leads')}>Add lead</button>}
          </>
        }
      />

      {notice && <div className={`alert alert-${notice.tone === 'danger' ? 'danger' : notice.tone === 'warning' ? 'warning' : 'success'} small`}>{notice.text}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="row g-3 mb-4">
            {stats.map((stat) => (
              <div key={stat.label} className="col-12 col-md-6 col-xl-3">
                <StatCard label={stat.label} value={fmtNumber(stat.value)} sub={stat.tone ? `Tracker: ${stat.tone}` : undefined} tone={stat.tone === 'success' ? '#2bb673' : stat.tone === 'warning' ? '#f3b848' : undefined} />
              </div>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-xl-8">
              <Panel title="Campaign target: 500 unique, verified, eligible leads" pad={false}>
                <div className="p-3">
                  <div className="d-flex justify-content-between small mb-2">
                    <span>{data?.target ?? 500} target</span>
                    <strong>{progressLabel}</strong>
                  </div>
                  <div className="progress" style={{ height: '12px' }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${data?.progressPct ?? 0}%` }} aria-valuenow={data?.progressPct ?? 0} aria-valuemin="0" aria-valuemax="100" />
                  </div>
                  <p className="small mt-3 mb-0 text-body-secondary">{data?.insight || 'Shortfall is shown honestly and never padded.'}</p>
                </div>
              </Panel>
            </div>

            <div className="col-12 col-xl-4">
              <Panel title="Source readiness" pad={false}>
                <div className="p-3">
                  {sources.length === 0 ? <EmptyState icon="◌" title="No sources" body="Import sources appear here after CSV dedup and validation." /> : sources.map((source) => (
                    <div key={source.source} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="small">{source.source}</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="small text-body-secondary">{source.count}</span>
                        <StatusBadge status={source.ready ? 'ready' : 'pending'} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-xl-6">
              <Panel title="Lead funnel">
                {funnel.map((item) => (
                  <div key={item.name} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="small">{item.name}</span>
                    <strong className="small">{fmtNumber(item.value)}</strong>
                  </div>
                ))}
              </Panel>
            </div>

            <div className="col-12 col-xl-6">
              <Panel title="Segments A / B / C">
                {segments.map((segment) => (
                  <div key={segment.segment} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="small">Segment {segment.segment}</span>
                    <span className="small text-body-secondary">{segment.leads} leads · avg {segment.avgScore}</span>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Leads' && (
        <div className="row g-3">
          <div className="col-12 col-xl-4">
            <Panel title={writable ? 'Add / update lead' : 'Lead view'}>
              {!writable && <p className="small mb-3 text-body-secondary">Your role can view lead data but not change it.</p>}
              {writable && (
                <form onSubmit={saveLead}>
                  <div className="mb-2">
                    <label className="form-label small">Lead name</label>
                    <input className="form-control form-control-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Segment</label>
                    <select className="form-select form-select-sm" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                      {['A', 'B', 'C'].map((segment) => <option key={segment} value={segment}>{segment}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Channel</label>
                    <select className="form-select form-select-sm" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                      {['WhatsApp', 'Email', 'Meta lead form', 'Bulk CSV import'].map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">Source</label>
                    <input className="form-control form-control-sm" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small">Score</label>
                      <input type="number" min="0" max="100" className="form-control form-control-sm" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Status</label>
                      <select className="form-select form-select-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        {['verified', 'eligible', 'qualified', 'new'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-primary" type="submit">Save lead</button>
                </form>
              )}
            </Panel>
          </div>

          <div className="col-12 col-xl-8">
            <Panel title="Lead roster">
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Segment</th>
                      <th>Source</th>
                      <th>Channel</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="small fw-semibold">{lead.id}</td>
                        <td className="small">{lead.name}</td>
                        <td className="small">{lead.segment}</td>
                        <td className="small">{lead.source}</td>
                        <td className="small">{lead.channel}</td>
                        <td className="small">{lead.score}</td>
                        <td><StatusBadge status={lead.status || 'new'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'Imports' && (
        <div className="row g-3">
          <div className="col-12 col-xl-6">
            <Panel title="Import sources">
              {sources.map((source) => (
                <div key={source.source} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-semibold small">{source.source}</div>
                    <div className="small text-body-secondary">Dedup + source attribution enabled</div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="small">{source.count}</span>
                    <StatusBadge status={source.ready ? 'ready' : 'pending'} />
                  </div>
                </div>
              ))}
            </Panel>
          </div>

          <div className="col-12 col-xl-6">
            <Panel title="Channel split">
              {channels.map((channel) => (
                <div key={channel.channel} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span className="small">{channel.channel}</span>
                  <strong className="small">{channel.leads}</strong>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'Campaigns' && (
        <div className="row g-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="col-12 col-xl-4">
              <Panel title={campaign.name}>
                <div className="small text-body-secondary mb-2">{campaign.channel}</div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small">Budget</span>
                  <strong className="small">{fmtMoney(campaign.budget, 'PKR')}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small">Leads</span>
                  <strong className="small">{campaign.leads}</strong>
                </div>
                <StatusBadge status={campaign.state === 'active' ? 'active' : campaign.state === 'scheduled' ? 'pending' : 'secondary'} label={campaign.state} />
              </Panel>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Integrations' && (
        <div className="row g-3">
          <div className="col-12 col-xl-6">
            <Panel title="Delivery systems">
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="small">Email ESP</span>
                <StatusBadge status="pending" label="Not connected" />
              </div>
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="small">WhatsApp Business</span>
                <StatusBadge status="pending" label="Not connected" />
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="small">Meta lead forms</span>
                <StatusBadge status="pending" label="Not connected" />
              </div>
            </Panel>
          </div>

          <div className="col-12 col-xl-6">
            <Panel title="Recent activity">
              {data?.recentActivity?.map((item) => (
                <div key={item.id} className="border-bottom py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="small">{item.type}</strong>
                    <span className="small text-body-secondary">{fmtDateTime(item.ts)}</span>
                  </div>
                  <div className="small text-body-secondary mt-1">{item.detail}</div>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'Compliance' && (
        <div className="row g-3">
          <div className="col-12 col-xl-6">
            <Panel title="Compliance checks">
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="small">Consent-first email / WhatsApp</span>
                <StatusBadge status="pending" label="Not configured" />
              </div>
              <div className="d-flex justify-content-between border-bottom py-2">
                <span className="small">GDPR / PECR / CAN-SPAM / CASL</span>
                <StatusBadge status="pending" label="Requires review" />
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="small">Pakistan PECA / PTA</span>
                <StatusBadge status="pending" label="Requires review" />
              </div>
            </Panel>
          </div>

          <div className="col-12 col-xl-6">
            <Panel title="Send gate / suppression">
              <div className="small text-body-secondary">
                Outreach and suppression enforcement are not connected in this module yet. Do not send messages from this page; configure and verify the required consent, suppression and send-gate integrations first.
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
