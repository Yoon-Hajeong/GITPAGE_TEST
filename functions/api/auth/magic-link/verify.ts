import { createRedirectResponse, createErrorResponse, setSessionCookie, getSessionIdFromCookie } from "../../_lib/session";
import { getMagicLinkToken, consumeMagicLinkToken, getUserByEmail, createSession } from "../../_lib/db";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return createErrorResponse("Missing token", 400);
  }

  try {
    const tokenData = await getMagicLinkToken(context.env.DB, token);

    if (!tokenData) {
      return createErrorResponse("Invalid or expired token", 401);
    }

    if (tokenData.consumed_at !== null) {
      return createErrorResponse("Token already used", 401);
    }

    if (tokenData.expires_at < Date.now()) {
      return createErrorResponse("Token expired", 401);
    }

    // Mark token as consumed
    await consumeMagicLinkToken(context.env.DB, token);

    // Get user
    const user = await getUserByEmail(context.env.DB, tokenData.email);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Create session
    const sessionId = await createSession(context.env.DB, user.id, 30);
    const setCookieHeader = setSessionCookie(sessionId);

    // Redirect to dashboard (또는 사용자 사이트의 로그인 완료 페이지)
    return createRedirectResponse("/dashboard", setCookieHeader);
  } catch (error) {
    console.error(error);
    return createErrorResponse("Internal server error", 500);
  }
};
