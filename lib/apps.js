// Central App Registry — every connected application is described here.
// Status values: connected | degraded | pending | disconnected
// 'pending' = registered but requires configuration before it can be marked healthy.

export const APP_COLORS = {
  'playbeat-digital': '#4c8dff',
  'playbeat-live': '#7c5cff',
  magxtv: '#2fbf71',
  makethisdeal: '#f5a623',
  'pulse-crm': '#e5537a',
};

export const APPS = [
  {
    slug: 'playbeat-digital',
    name: 'PlayBeat.digital',
    short: 'Digital',
    domain: 'playbeat.digital',
    connector: 'REST API (native)',
    status: 'connected',
    lastSync: '2026-10-11T09:42:00Z',
    modules: ['Products & licenses', 'Orders & payments', 'Customers', 'Subscriptions'],
    summary: 'Storefront, products, orders, customers, subscriptions and payments.',
  },
  {
    slug: 'playbeat-live',
    name: 'PlayBeat.live',
    short: 'Live',
    domain: 'playbeat.live',
    connector: 'REST API (native)',
    status: 'connected',
    lastSync: '2026-10-11T09:38:00Z',
    modules: ['Channels', 'Playlists', 'Playback health', 'Audience analytics'],
    summary: 'Entertainment streaming, live channels, playlists and audience metrics.',
  },
  {
    slug: 'magxtv',
    name: 'MagXTV.click',
    short: 'MagXTV',
    domain: 'magxtv.click',
    connector: 'REST API (native)',
    status: 'degraded',
    lastSync: '2026-10-11T08:57:00Z',
    modules: ['Schedules', 'Results', 'Highlights', 'Broadcast health'],
    summary: 'Sports broadcasting: live matches, schedules, results and statistics.',
  },
  {
    slug: 'makethisdeal',
    name: 'MakeThisDeal.biz',
    short: 'Deals',
    domain: 'makethisdeal.biz',
    connector: 'REST API (native)',
    status: 'connected',
    lastSync: '2026-10-11T09:31:00Z',
    modules: ['Listings', 'Leads', 'Enquiries', 'Transactions'],
    summary: 'Business marketplace: listings, leads, enquiries and transactions.',
  },
  {
    slug: 'pulse-crm',
    name: 'PlayBeat Pulse CRM',
    short: 'Pulse CRM',
    domain: 'crm.playbeat.digital',
    connector: 'GitHub: uzzirulzz-cyber/eaedpulseplus (stub installed)',
    status: 'pending',
    lastSync: null,
    modules: ['Pipelines', 'Leads', 'Tasks', 'WhatsApp / Meta integrations'],
    summary: 'CRM pipelines, lead management, tasks and messaging integrations.',
  },
];

export const appBySlug = (slug) => APPS.find((a) => a.slug === slug);
