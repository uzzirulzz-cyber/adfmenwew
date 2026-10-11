
// Admin-supplied connector credentials, held in the keyed server-side config store.
// Reads are always MASKED: the plain value never travels back to the browser.
// Environment variables remain the primary source; stored values only fill a gap,
// so an operator can rotate everything by changing the deployment environment.
import { getConfig } from '../config';

export const CONNECTOR_SLUGS = {
  'playbeat-digital': 'PLAYBEAT_DIGITAL',
  'playbeat-live': 'PLAYBEAT_LIVE',
  magxtv: 'MAGXTV',
  makethisdeal: 'MAKETHISDEAL',
  'pulse-crm': 'PULSE_CRM',
};

export const credKey = (slug) => `admin.connectors.${slug}`;
export const envKeysFor = (slug) => {
  const p = CONNECTOR_SLUGS[slug];
  return p ? { url: `${p}_API_URL`, key: `${p}_API_KEY` } : { url: null, key: null };
};

export function mask(value) {
  if (!value) return '';
  const s = String(value);
  return s.length <= 4 ? '••••' : `••••••••${s.slice(-4)}`;
}

/** Presence report — never a value. */
export function envPresence() {
  const out = {};
  for (const [slug, prefix] of Object.entries(CONNECTOR_SLUGS)) {
    const u = `${prefix}_API_URL`;
    const k = `${prefix}_API_KEY`;
    out[slug] = {
      urlKey: u, keyKey: k,
      urlPresent: Boolean(process.env[u]), keyPresent: Boolean(process.env[k]),
    };
  }
  return out;
}

/** Push stored credentials into process.env (only where the env is empty). */
export async function hydrateConnectorEnv() {
  const filled = [];
  for (const slug of Object.keys(CONNECTOR_SLUGS)) {
    try {
      const c = await getConfig(credKey(slug));
      if (!c) continue;
      const { url, key } = envKeysFor(slug);
      if (c.apiUrl && url && !process.env[url]) { process.env[url] = String(c.apiUrl); filled.push(url); }
      if (c.apiKey && key && !process.env[key]) { process.env[key] = String(c.apiKey); filled.push(key); }
    } catch { /* config store unavailable — env-only, fail closed */ }
  }
  return filled;
}
