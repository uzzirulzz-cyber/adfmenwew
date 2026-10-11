// ============================================================
// PlayBeat Pulse CRM adapter — repo `uzzirulzz-cyber/eaedpulseplus`.
//
// HONESTY NOTE: the repository could not be retrieved from here (the request
// failed — it is private, renamed, or unavailable to an unauthenticated fetch),
// so NOTHING about its modules, endpoints, models or dependencies is assumed in
// this file. No module names are invented. This adapter speaks the same generic
// REST contract as the other connectors and stays firmly 'pending' until the
// credentials exist. Supply the base URL + key and, if the service deviates from
// the conventional shape, adjust the marked spots in ./rest.js.
// ============================================================
import { RestConnector } from './rest';
import { setSyncState } from '../store';

export class PulseCrmConnector extends RestConnector {
  constructor() {
    super({
      slug: 'pulse-crm',
      name: 'PlayBeat Pulse CRM',
      envPrefix: 'PULSE_CRM',
      resources: ['pipelines', 'leads', 'tasks'],
    });
    this.repo = process.env.PULSE_CRM_REPO || 'uzzirulzz-cyber/eaedpulseplus';
  }

  get configured() { return Boolean(this.baseUrl && this.apiKey); }

  /** Never reports healthy while unconfigured — no fabricated CRM metrics. */
  async healthCheck() {
    if (!this.configured) {
      return {
        ok: false,
        status: 'pending',
        reason: `not configured — missing ${this.missingVars.join(', ')} (source: ${this.repo})`,
      };
    }
    return super.healthCheck();
  }

  async sync() {
    if (!this.configured) {
      const reason = `not configured — missing ${this.missingVars.join(', ')}`;
      await setSyncState(this.slug, { status: 'pending', error: reason, lastAttempt: new Date().toISOString() });
      return { ok: false, status: 'pending', reason };
    }
    return super.sync();
  }
}
