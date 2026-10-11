# PlayBeat Digital — Central Administration upgrade

Upgrade of the existing repo (`uzzirulzz-cyber/adfmenwew`), not a rebuild. Every pre-existing route,
API, auth path, database schema and storefront page is preserved; new modules were added alongside.

## Modules added (each wired to a real server endpoint)
| Area | Route | Backing endpoint |
|---|---|---|
| Central Command Center | /admin/command-center | /api/admin/overview, /api/health |
| Applications & Health | /admin/applications | /api/health, /api/connectors/[app] |
| Theme Studio | /admin/theme-studio | /api/admin/theme (draft · publish · revert · versions · contrast) |
| Visual Page Builder | /admin/page-builder | /api/admin/cms |
| Website CMS | /admin/cms | /api/admin/cms |
| SEO & Discovery | /admin/seo | /api/admin/settings?group=seo |
| Payment Gateways | /admin/payments | /api/admin/settings?group=payments |
| Marketing | /admin/marketing | /api/admin/marketing |
| Analytics | /admin/analytics | /api/admin/analytics |
| Finance & Revenue | /admin/finance | /api/admin/finance |
| Security & Audit | /admin/security | /api/admin/security |
| CRM & Leads | /admin/crm | /api/admin/records/crm |
| Support | /admin/support | /api/admin/records/support |
| WhatsApp / Meta Inbox | /admin/inbox | /api/admin/records/inbox |
| MagXTV Sports | /admin/magxtv | /api/admin/records/magxtv |
| Settings group API (new) | — | /api/admin/settings (seo · payments · general) |

Shared components: ModuleWorkspace, DataGrid, DashboardGrid, ThemeProvider, PayloadView.

## Migration steps
1. `npm install`
2. Create `.env.local` from `.env.example` (never commit it). Production requires `DATABASE_URL` or `POSTGRES_URL`.
3. `npm run db:migrate` — creates pb_users, pb_sessions, pb_login_attempts, pb_records, pb_sync_state, pb_audit. No destructive change.
4. `npm run seed:admin` — creates/updates the first admin, then remove ADMIN_PASSWORD from `.env.local`.
5. `npm run build && npm start` → open `/admin`.

## Integration status (honest)
- Answering now: auth, RBAC, audit, theme, CMS, marketing, layout, records, connectors, health.
- Needs credentials before it can show data: PlayBeat.digital, PlayBeat.live, MagXTV, MakeThisDeal,
  Pulse CRM (`uzzirulzz-cyber/eaedpulseplus`), WhatsApp/Meta. These report **pending / not configured
  with no metrics** rather than placeholder numbers.
- Deferred: live gateway settlement figures, Search Console/AdSense indexation & ad revenue,
  MagXTV betting (intentionally disabled).
