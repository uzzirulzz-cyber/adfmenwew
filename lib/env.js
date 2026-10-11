// ============================================================
// Server-only environment introspection for the Settings page.
// Exposes PRESENCE, never values.
// ============================================================

const CHECKS = [
  { group: 'Session & auth', vars: ['PB_SESSION_SECRET', 'PB_CSRF_SECRET'], required: true },
  { group: 'PlayBeat.digital', vars: ['PLAYBEAT_DIGITAL_API_URL', 'PLAYBEAT_DIGITAL_API_KEY'], required: true },
  // PlayBeat.live's API answers without auth (verified: GET /api/health and
  // GET /api/channels both return 200 with no key), so only the URL is required.
  { group: 'PlayBeat.live', vars: ['PLAYBEAT_LIVE_API_URL', 'PLAYBEAT_LIVE_API_KEY'], required: true, optionalVars: ['PLAYBEAT_LIVE_API_KEY'] },
  { group: 'PlayBeat Live dashboard bridge', vars: ['LIVE_DASHBOARD_TOKEN'], required: false },
  { group: 'MagXTV.click', vars: ['MAGXTV_API_URL', 'MAGXTV_API_KEY'], required: true },
  { group: 'MakeThisDeal.biz', vars: ['MAKETHISDEAL_API_URL', 'MAKETHISDEAL_API_KEY'], required: true },
  { group: 'Pulse CRM', vars: ['PULSE_CRM_API_URL', 'PULSE_CRM_API_KEY'], required: false },
  { group: 'Meta / WhatsApp', vars: ['META_GRAPH_VERSION', 'META_WABA_TOKEN', 'META_PHONE_NUMBER_ID', 'META_FB_APP_SECRET'], required: false },
  { group: 'Meta webhook', vars: ['META_WEBHOOK_VERIFY_TOKEN'], required: false },
];

export function envReport() {
  return CHECKS.map((c) => {
    const optional = new Set(c.optionalVars || []);
    const vars = c.vars.map((v) => ({ name: v, present: Boolean(process.env[v]), required: !optional.has(v) }));
    // A group is complete when every REQUIRED variable is present; an optional
    // variable (e.g. a key the upstream does not check) never blocks it.
    const requiredVars = vars.filter((v) => v.required);
    const gate = requiredVars.length ? requiredVars : vars;
    return {
      group: c.group,
      required: c.required,
      vars,
      complete: gate.every((v) => v.present),
    };
  });
}

export function connectorMode() {
  const mode = (process.env.PB_CONNECTOR_MODE || 'demo').toLowerCase();
  return mode === 'live' ? 'live' : 'demo';
}
