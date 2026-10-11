// ============================================================
// Server-side authorization — the single source of truth (README §8.4).
// The role matrix rendered in Staff/Roles is only a VIEW of this table.
// ============================================================

export const ROLES = ['Super Admin', 'App Admin', 'Sales', 'Support', 'Read-only'];

// action -> one explicit boolean per role, in ROLES order.
//                        SuperAdm AppAdm Sales Support ReadOnly
const MATRIX = {
  'apps:manage':       [true,  false, false, false,  false],
  'products:write':    [true,  true,  false, false,  false],
  'orders:refund':     [true,  true,  false, true,   false],
  'crm:assign':        [true,  true,  true,  false,  false],
  'broadcast:control': [true,  true,  false, false,  false],
  'reports:export':    [true,  true,  true,  true,   true ],
  'dashboard:view':    [true,  true,  true,  true,   true ],
};

export const ACTIONS = Object.keys(MATRIX);

export function roleCan(role, action) {
  const row = MATRIX[action];
  const col = ROLES.indexOf(role);
  if (!row || col === -1) return false;
  return row[col] === true;
}

export const ROLE_MATRIX = MATRIX;

/**
 * Default-deny permission check. A role supplied by the client is never
 * trusted — `session` is always the server-side session record.
 */
export function can(session, action, appSlug = null) {
  if (!session || session.revokedAt) return false;              // no session -> deny
  if (typeof action !== 'string' || !MATRIX[action]) return false; // unknown action -> deny
  if (!roleCan(session.role, action)) return false;              // role not allowed
  if (appSlug) {
    const scope = Array.isArray(session.apps) ? session.apps : [];
    if (!scope.includes('*') && !scope.includes(appSlug)) return false; // out of app scope
  }
  return true;
}

/** Human-readable reason, for audit entries. */
export function denyReason(session, action, appSlug) {
  if (!session) return 'no session';
  if (session.revokedAt) return 'session revoked';
  if (!MATRIX[action]) return `unknown action ${action}`;
  if (!roleCan(session.role, action)) return `role ${session.role} lacks ${action}`;
  if (appSlug) {
    const scope = Array.isArray(session.apps) ? session.apps : [];
    if (!scope.includes('*') && !scope.includes(appSlug)) return `app scope excludes ${appSlug}`;
  }
  return 'forbidden';
}
