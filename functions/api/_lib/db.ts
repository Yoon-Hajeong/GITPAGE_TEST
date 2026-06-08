export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  auth_method: string;
  tier: string;
};

export async function getUserByEmail(
  db: D1Database,
  email: string
): Promise<SessionUser | null> {
  const result = await db
    .prepare("SELECT id, email, name, image, auth_method, tier FROM users WHERE email = ?")
    .bind(email)
    .first();
  return result || null;
}

export async function getUserById(
  db: D1Database,
  id: string
): Promise<SessionUser | null> {
  const result = await db
    .prepare("SELECT id, email, name, image, auth_method, tier FROM users WHERE id = ?")
    .bind(id)
    .first();
  return result || null;
}

export async function createUser(
  db: D1Database,
  user: {
    email: string;
    name?: string;
    image?: string;
    auth_method: string;
    google_sub?: string;
  }
): Promise<SessionUser> {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  await db
    .prepare(
      `INSERT INTO users (id, email, name, image, auth_method, google_sub, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, user.email, user.name || null, user.image || null, user.auth_method, user.google_sub || null, now, now)
    .run();

  return {
    id,
    email: user.email,
    name: user.name || null,
    image: user.image || null,
    auth_method: user.auth_method,
    tier: "free",
  };
}

export async function getMagicLinkToken(
  db: D1Database,
  token: string
): Promise<{ email: string; expires_at: number; consumed_at: number | null } | null> {
  const result = await db
    .prepare("SELECT email, expires_at, consumed_at FROM magic_link_tokens WHERE token = ?")
    .bind(token)
    .first();
  return result || null;
}

export async function createMagicLinkToken(
  db: D1Database,
  email: string,
  expiresInMinutes: number = 15
): Promise<string> {
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + expiresInMinutes * 60 * 1000;

  await db
    .prepare(
      `INSERT INTO magic_link_tokens (token, email, expires_at, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(token, email, expiresAt, now)
    .run();

  return token;
}

export async function consumeMagicLinkToken(
  db: D1Database,
  token: string
): Promise<void> {
  await db
    .prepare("UPDATE magic_link_tokens SET consumed_at = ? WHERE token = ?")
    .bind(Date.now(), token)
    .run();
}

export async function createSession(
  db: D1Database,
  userId: string,
  expiresInDays: number = 30
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + expiresInDays * 24 * 60 * 60 * 1000;

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(sessionId, userId, expiresAt, now)
    .run();

  return sessionId;
}

export async function getSessionUser(
  db: D1Database,
  sessionId: string
): Promise<SessionUser | null> {
  const result = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.image, u.auth_method, u.tier
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > ?`
    )
    .bind(sessionId, Date.now())
    .first();
  return result || null;
}

export async function deleteSession(
  db: D1Database,
  sessionId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM sessions WHERE id = ?")
    .bind(sessionId)
    .run();
}

export async function getUserByGoogleSub(
  db: D1Database,
  googleSub: string
): Promise<SessionUser | null> {
  const result = await db
    .prepare("SELECT id, email, name, image, auth_method, tier FROM users WHERE google_sub = ?")
    .bind(googleSub)
    .first();
  return result || null;
}
