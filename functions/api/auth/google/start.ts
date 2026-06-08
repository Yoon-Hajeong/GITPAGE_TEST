import { createRedirectResponse } from "../../_lib/session";

export const onRequest: PagesFunction = async (context) => {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  
  const params = {
    client_id: context.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${context.env.APP_ORIGIN}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state: crypto.randomUUID(),
  };

  Object.entries(params).forEach(([key, value]) => {
    googleAuthUrl.searchParams.append(key, value);
  });

  return createRedirectResponse(googleAuthUrl.toString());
};
