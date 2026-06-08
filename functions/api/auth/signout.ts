import { getSessionIdFromCookie, clearSessionCookie, createJsonResponse } from "../_lib/session";
import { deleteSession } from "../_lib/db";

export const onRequest: PagesFunction = async (context) => {
  const sessionId = getSessionIdFromCookie(context.request);

  if (sessionId) {
    await deleteSession(context.env.DB, sessionId);
  }

  return createJsonResponse({ success: true }, 200, clearSessionCookie());
};
