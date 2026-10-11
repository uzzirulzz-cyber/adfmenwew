// ============================================================
// Connector registry + the ONE explicit live/demo switch (README §5, §6).
// ============================================================
import { APPS } from '../apps';
import { RestConnector } from './rest';
import { PulseCrmConnector } from './pulse';
import { WhatsAppConnector } from './meta';
import { getSyncState } from '../store';

const ENV_PREFIX = {
  'playbeat-digital': 'PLAYBEAT_DIGITAL',
  'playbeat-live': 'PLAYBEAT_LIVE',
  magxtv: 'MAGXTV',
  makethisdeal: 'MAKETHISDEAL',
};

const RESOURCES = {
  'playbeat-digital': ['products', 'orders', 'customers', 'subscriptions'],
  'playbeat-live': ['channels', 'playlists', 'sessions'],
  magxtv: ['schedules', 'results', 'highlights'],
  makethisdeal: ['listings', 'leads', 'enquiries', 'transactions'],
};

const adapters = {};
for (const app of APPS) {
  if (app.slug === 'pulse-crm') {
    adapters[app.slug] = new PulseCrmConnector();
  } else {
    adapters[app.slug] = new RestConnector({
      slug: app.slug,
      name: app.name,
      envPrefix: ENV_PREFIX[app.slug],
      resources: RESOURCES[app.slug] || [],
    });
  }
}

export const whatsapp = new WhatsAppConnector();

export function getConnector(slug) {
  return adapters[slug] || null;
}

export const CONNECTOR_MODE = () =>
  (process.env.PB_CONNECTOR_MODE || 'demo').toLowerCase() === 'live' ? 'live' : 'demo';

/**
 * Status for one app. In 'live' mode an unconfigured app is ALWAYS 'pending'
 * with no metrics — the honesty rule, enforced in code rather than promised.
 */
export async function connectorStatus(slug) {
  const adapter = getConnector(slug);
  const mode = CONNECTOR_MODE();
  if (!adapter) return { slug, mode, configured: false, status: 'pending', reason: 'no adapter' };

  const state = await getSyncState(slug);
  if (mode === 'demo') {
    return {
      slug, mode, configured: adapter.configured,
      status: state?.status || 'demo',
      lastSync: state?.lastSync || null,
      reason: 'PB_CONNECTOR_MODE=demo — fixture data, not live',
      missingVars: adapter.missingVars,
    };
  }
  if (!adapter.configured) {
    return {
      slug, mode, configured: false, status: 'pending',
      lastSync: state?.lastSync || null,
      reason: `not configured — missing ${adapter.missingVars.join(', ')}`,
      missingVars: adapter.missingVars,
    };
  }
  return {
    slug, mode, configured: true,
    status: state?.status === 'degraded' ? 'degraded' : 'connected',
    lastSync: state?.lastSync || null,
    error: state?.error || null,
    missingVars: [],
  };
}

export async function allConnectorStatuses() {
  return Promise.all(APPS.map((a) => connectorStatus(a.slug)));
}
