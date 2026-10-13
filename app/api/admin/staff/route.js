// ============================================================
// /api/admin/staff — real staff + audit reads, guarded (README §8.4).
// ============================================================
import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth/sessions';
import { can, denyReason, ROLE_MATRIX, ROLES } from '../../../../lib/rbac';
import { listUsers, upsertUser, setUserRole, revokeAllForUser } from '../../../../lib/auth/store';
import { readAudit, audit } from '../../../../lib/audit';
import { csrfValid } from '../../../../lib/auth/guard';
import { hashPin } from '../../../../lib/auth/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession({ touch: true });
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!session.pinSetupRequired && !can(session, 'dashboard:view')) {
    return NextResponse.json({ error: 'forbidden', reason: denyReason(session, 'dashboard:view') }, { status: 403 });
  }

  // Never leak credential hashes or MFA secrets to the client.
  const allUsers = await listUsers();
  const visibleUsers = session.pinSetupRequired
    ? allUsers.filter((user) => user.id === session.userId)
    : allUsers;
  const users = visibleUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    apps: u.apps || [],
    pinConfigured: Boolean(u.pinHash),
    needsPinSetup: !u.pinHash,
    mfaSecret: Boolean(u.mfaSecret),
    disabled: Boolean(u.disabled),
    updatedAt: u.updatedAt || null,
  }));

  return NextResponse.json({
    users,
    audit: session.pinSetupRequired ? [] : await readAudit(200),
    matrix: ROLE_MATRIX,
    roles: ROLES,
  });
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!csrfValid(req)) return NextResponse.json({ error: 'invalid csrf token' }, { status: 403 });

  let body = {};
  try { body = await req.json(); } catch { /* ignore */ }

  if (body.action === 'set-pin') {
    const pin = String(body.pin || '');
    if (!/^\d{5}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 5 digits.' }, { status: 400 });
    }

    const userId = String(body.userId || '');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const target = (await listUsers()).find((user) => user.id === userId);
    if (!target) return NextResponse.json({ error: 'user not found' }, { status: 404 });

    const isSelf = target.id === session.userId || target.email === session.email;
    if (!isSelf && !can(session, 'apps:manage')) {
      return NextResponse.json({ error: 'forbidden', reason: denyReason(session, 'apps:manage') }, { status: 403 });
    }

    const updatedUser = {
      ...target,
      pinHash: await hashPin(pin),
      passwordHash: null,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    };
    await upsertUser(updatedUser);
    const revoked = await revokeAllForUser(target.id);
    await audit({
      action: 'auth.pin.set',
      actor: session.email,
      target: target.email,
      result: 'success',
      reason: `revoked ${revoked} live session(s)`,
    });

    return NextResponse.json({ ok: true, revoked, userId: target.id });
  }

  if (body.action !== 'set-role') {
    return NextResponse.json({ error: 'unsupported action' }, { status: 400 });
  }
  if (!can(session, 'apps:manage')) {
    return NextResponse.json({ error: 'forbidden', reason: denyReason(session, 'apps:manage') }, { status: 403 });
  }
  if (!ROLES.includes(body.role)) {
    return NextResponse.json({ error: `unknown role '${body.role}'` }, { status: 400 });
  }

  const result = await setUserRole(body.userId, body.role, body.apps || ['*'], session.email);
  if (!result) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  // A role change revokes the target's live sessions — the new role applies on
  // their next request instead of when their old token happens to expire.
  await audit({
    action: 'role.changed',
    actor: session.email,
    target: `${result.user.email} → ${body.role}`,
    result: 'success',
    reason: `revoked ${result.revoked} live session(s)`,
  });

  return NextResponse.json({ ok: true, revoked: result.revoked });
}

export async function DELETE(req) {
  // Admin-initiated "revoke all sessions" for a user.
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!csrfValid(req)) return NextResponse.json({ error: 'invalid csrf token' }, { status: 403 });
  if (!can(session, 'apps:manage')) {
    return NextResponse.json({ error: 'forbidden', reason: denyReason(session, 'apps:manage') }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const n = await revokeAllForUser(userId);
  await audit({ action: 'session.revoked_all', actor: session.email, target: userId, result: 'success', reason: `${n} session(s)` });
  return NextResponse.json({ ok: true, revoked: n });
}
