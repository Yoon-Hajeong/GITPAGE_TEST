import { getSessionIdFromCookie, createJsonResponse } from "../_lib/session";
import { getSessionUser } from "../_lib/db";

export const onRequest: PagesFunction = async (context) => {
  const sessionId = getSessionIdFromCookie(context.request);

  if (!sessionId) {
    return createJsonResponse({ user: null });
  }

  const user = await getSessionUser(context.env.DB, sessionId);
  return createJsonResponse({ user });
};
