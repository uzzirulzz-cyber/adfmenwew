// ============================================================
// Generic REST connector adapter (PlayBeat.digital, PlayBeat.live,
// MagXTV.click, MakeThisDeal.biz).
//
// The contract is fixed (README §5); only the base URL and key differ. Every
// method is a no-op that reports 'pending' when credentials are absent — an
// app is never marked healthy without an authenticated 2xx health check.
//
// ASSUMED API SHAPE — NOT VERIFIED. These four apps are first-party, and no API
// specification was supplied, so the resource paths, the `/health` endpoint and
// the list-envelope keys (`data` / `items`, `next_page`) are CONVENTIONS this
// adapter expects. Point it at a real spec or openapi.json and adjust the three
// marked spots. It makes no claim about how these services actually respond.
// ============================================================
import { request } from '../http';
import { upsertRecords, setSyncState } from '../store';

export class RestConnector {
  constructor({ slug, name, envPrefix, resources = [] }) {
    this.slug = slug;
    this.name = name;
    this.envPrefix = envPrefix;
    this.resources = resources;
  }

  get baseUrl() { return process.env[`${this.envPrefix}_API_URL`] || null; }
  get apiKey() { return process.env[`${this.envPrefix}_API_KEY`] || null; }
  get configured() { return Boolean(this.baseUrl && this.apiKey); }

  get missingVars() {
    const out = [];
    if (!this.baseUrl) out.push(`${this.envPrefix}_API_URL`);
    if (!this.apiKey) out.push(`${this.envPrefix}_API_KEY`);
    return out;
  }

  headers() {
    // Convention: bearer auth. Swap here if the service uses a custom header.
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /** Resolve true ONLY on an authenticated 2xx. */
  async healthCheck() {
    if (!this.configured) {
      return { ok: false, status: 'pending', reason: `not configured — missing ${this.missingVars.join(', ')}` };
    }
    try {
      // Spot 1/3: health path convention.
      await request(this.slug, `${this.baseUrl}/health`, { headers: this.headers() });
      return { ok: true, status: 'connected', checkedAt: new Date().toISOString() };
    } catch (e) {
      return { ok: false, status: 'degraded', reason: e.message, checkedAt: new Date().toISOString() };
    }
  }

  async read(resource, { page = 1, perPage = 100, since } = {}) {
    if (!this.configured) throw new Error(`${this.name} is not configured`);
    const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (since) qs.set('since', since);
    const data = await request(this.slug, `${this.baseUrl}/${resource}?${qs.toString()}`, {
      headers: this.headers(),
    });
    // Spot 2/3: list-envelope convention.
    const rows = Array.isArray(data) ? data : (data?.data || data?.items || data?.results || []);
    const nextPage = Array.isArray(data) ? null : (data?.next_page ?? data?.nextPage ?? null);
    return { rows, nextPage };
  }

  async readAll(resource, { maxPages = 20, since } = {}) {
    const out = [];
    let page = 1;
    while (page && page <= maxPages) {
      const { rows, nextPage } = await this.read(resource, { page, since });
      out.push(...rows);
      page = nextPage ? Number(nextPage) : null;
    }
    return out;
  }

  async write(resource, payload) {
    if (!this.configured) throw new Error(`${this.name} is not configured`);
    return request(this.slug, `${this.baseUrl}/${resource}`, {
      method: 'POST',
      headers: this.headers(),
      body: payload,
    });
  }

  /** Idempotent: replay converges, duplicates are impossible. */
  async sync(resources = this.resources, { since } = {}) {
    if (!this.configured) {
      return { ok: false, status: 'pending', reason: `not configured — missing ${this.missingVars.join(', ')}` };
    }
    const startedAt = new Date().toISOString();
    const summary = {};
    try {
      for (const resource of resources) {
        const rows = await this.readAll(resource, { since });
        summary[resource] = await upsertRecords(this.slug, rows);
      }
      const state = await setSyncState(this.slug, {
        status: 'connected',
        lastSync: new Date().toISOString(),
        lastResult: summary,
        error: null,
      });
      return { ok: true, status: 'connected', startedAt, summary, lastSync: state.lastSync };
    } catch (e) {
      await setSyncState(this.slug, { status: 'degraded', error: e.message, lastAttempt: startedAt });
      return { ok: false, status: 'degraded', reason: e.message, startedAt, summary };
    }
  }
}
