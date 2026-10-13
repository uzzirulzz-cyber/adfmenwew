import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth/sessions';
import { can, denyReason } from '../../../../lib/rbac';
import { csrfValid } from '../../../../lib/auth/guard';
import { audit } from '../../../../lib/audit';
import { getConfig, setConfig } from '../../../../lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_STATE = {
  target: 500,
  progressPct: 0,
  targetMet: false,
  shortfall: 500,
  insight: 'No lead records have been imported yet. Progress will appear when real records are added.',
  stats: [
    { label: 'Discovered', value: 0, tone: 'secondary' },
    { label: 'Unique', value: 0, tone: 'primary' },
    { label: 'Verified', value: 0, tone: 'success' },
    { label: 'Eligible', value: 0, tone: 'warning' },
    { label: 'Qualified', value: 0, tone: 'info' },
  ],
  funnel: [
    { name: 'Discovered', value: 0 },
    { name: 'Unique', value: 0 },
    { name: 'Verified', value: 0 },
    { name: 'Eligible', value: 0 },
    { name: 'Contacted', value: 0 },
    { name: 'Replies', value: 0 },
    { name: 'Qualified', value: 0 },
  ],
  segments: [],
  channels: [],
  sources: [],
  campaigns: [],
  recentActivity: [],
  leads: [],
};

async function load() {
  const saved = await getConfig('lead-engine.state', DEFAULT_STATE);
  return saved && typeof saved === 'object' ? saved : DEFAULT_STATE;
}

export async function GET() {
  const session = await getSession({ touch: true });
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!can(session, 'marketing:write')) {
    return NextResponse.json({ error: 'forbidden', reason: denyReason(session, 'marketing:write') }, { status: 403 });
  }

  const state = await load();
  return NextResponse.json({ ok: true, ...state, permissions: { write: can(session, 'marketing:write') } });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!csrfValid(req)) return NextResponse.json({ error: 'invalid csrf token' }, { status: 403 });
  if (!can(session, 'marketing:write')) {
    await audit({ action: 'authz.denied', actor: session.email, target: 'lead-engine.write', result: 'denied' });
    return NextResponse.json({ error: 'forbidden', reason: denyReason(session, 'marketing:write') }, { status: 403 });
  }

  let body = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid request' }, { status: 400 }); }

  const state = await load();
  const action = String(body.action || '');

  try {
    if (action === 'save-campaign') {
      const campaign = { ...body.campaign, id: body.campaign?.id || `cmp-${Date.now().toString(36)}` };
      const campaigns = [...(state.campaigns || [])].filter((item) => item.id !== campaign.id);
      campaigns.unshift(campaign);
      const next = { ...state, campaigns, updatedAt: new Date().toISOString() };
      await setConfig('lead-engine.state', next, session.email);
      await audit({ action: 'lead-engine.campaign.saved', actor: session.email, target: campaign.name, result: 'success' });
      return NextResponse.json({ ok: true, message: 'Campaign saved.', ...next });
    }

    if (action === 'save-lead') {
      const lead = { ...body.lead, id: body.lead?.id || `PB-${Date.now().toString(36).toUpperCase()}` };
      const leads = [...(state.leads || [])].filter((item) => item.id !== lead.id);
      leads.unshift(lead);
      const next = { ...state, leads, updatedAt: new Date().toISOString() };
      await setConfig('lead-engine.state', next, session.email);
      await audit({ action: 'lead-engine.lead.saved', actor: session.email, target: lead.id, result: 'success' });
      return NextResponse.json({ ok: true, message: 'Lead saved.', ...next });
    }

    return NextResponse.json({ ok: false, error: 'unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'request failed' }, { status: 500 });
  }
}
