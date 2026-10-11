// ============================================================
// Server-only environment introspection for the Settings page.
// Exposes PRESENCE, never values.
// ============================================================

const CHECKS = [
  { group: 'Session & auth', vars: ['PB_SESSION_SECRET', 'PB_CSRF_SECRET'], required: true },
  { group: 'PlayBeat.digital', vars: ['PLAYBEAT_DIGITAL_API_URL', 'PLAYBEAT_DIGITAL_API_KEY'], required: true },
  { group: 'PlayBeat.live', vars: ['PLAYBEAT_LIVE_API_URL', 'PLAYBEAT_LIVE_API_KEY'], required: true },
  { group: 'MagXTV.click', vars: ['MAGXTV_API_URL', 'MAGXTV_API_KEY'], required: true },
  { group: 'MakeThisDeal.biz', vars: ['MAKETHISDEAL_API_URL', 'MAKETHISDEAL_API_KEY'], required: true },
  { group: 'Pulse CRM', vars: ['PULSE_CRM_API_URL', 'PULSE_CRM_API_KEY'], required: false },
  { group: 'Meta / WhatsApp', vars: ['META_GRAPH_VERSION', 'META_WABA_TOKEN', 'META_PHONE_NUMBER_ID', 'META_FB_APP_SECRET'], required: false },
  { group: 'Meta webhook', vars: ['META_WEBHOOK_VERIFY_TOKEN'], required: false },
];

export function envReport() {
  return CHECKS.map((c) => {
    const vars = c.vars.map((v) => ({ name: v, present: Boolean(process.env[v]) }));
    return {
      group: c.group,
      required: c.required,
      vars,
      complete: vars.every((v) => v.present),
    };
  });
}

export function connectorMode() {
  const mode = (process.env.PB_CONNECTOR_MODE || 'demo').toLowerCase();
  return mode === 'live' ? 'live' : 'demo';
}
