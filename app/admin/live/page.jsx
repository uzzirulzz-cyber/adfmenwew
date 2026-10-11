'use client';

import { CHANNELS } from '../../../lib/data';
import { PageHeader, Panel, DataTable, StatusBadge, BarChart } from '../../../components/ui';

export default function Live() {
  const viewers = CHANNELS.reduce((s, c) => s + c.viewers, 0);
  return (
    <>
      <PageHeader
        title="Live TV & Playlist Management"
        subtitle="Source: PlayBeat.live — channels, playlists, playback health and audience analytics."
        actions={<button className="btn btn-sm btn-primary">+ New channel</button>}
      />
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <Panel title="Channels" pad={false}>
            <DataTable
              pageSize={10}
              columns={[
                { key: 'name', label: 'Channel' },
                { key: 'category', label: 'Category' },
                { key: 'playlist', label: 'Playlist' },
                { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
                { key: 'health', label: 'Playback health', render: (r) => <StatusBadge status={r.health} /> },
                { key: 'viewers', label: 'Viewers', render: (r) => r.viewers.toLocaleString() },
                { key: 'actions', label: '', render: () => <button className="btn btn-sm btn-outline-secondary">Manage</button> },
              ]}
              rows={CHANNELS}
            />
          </Panel>
        </div>
        <div className="col-lg-5">
          <Panel title={`Audience now — ${viewers.toLocaleString()} viewers`}>
            <BarChart data={CHANNELS.map((c) => ({ label: c.name.split(' ')[0], value: c.viewers }))} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
          </Panel>
          <Panel title="Playlists" >
            <ul className="mb-0" style={{ fontSize: '.9rem' }}>
              {['Main Rotation', 'Night Drive', 'Weekend Mix', 'LoFi 24/7'].map((p) => (
                <li key={p} className="d-flex justify-content-between py-1">
                  <span>{p}</span>
                  <button className="btn btn-sm btn-outline-secondary">Edit</button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
