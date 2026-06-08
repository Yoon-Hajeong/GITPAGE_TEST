const SESSION_COOKIE_NAME = "session_id";
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export function setSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function getSessionIdFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(SESSION_COOKIE_NAME + "=")) {
      return cookie.slice(SESSION_COOKIE_NAME.length + 1);
    }
  }

  return null;
}

export function createJsonResponse(
  data: unknown,
  status: number = 200,
  setCookie?: string
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (setCookie) {
    response.headers.append("Set-Cookie", setCookie);
  }

  return response;
}

export function createRedirectResponse(url: string, setCookie?: string): Response {
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: url,
    },
  });

  if (setCookie) {
    response.headers.append("Set-Cookie", setCookie);
  }

  return response;
}

export function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
