import { createRedirectResponse, createErrorResponse, setSessionCookie } from "../../_lib/session";
import { getUserByGoogleSub, createUser, createSession } from "../../_lib/db";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return createErrorResponse(`Google auth failed: ${error}`, 400);
  }

  if (!code) {
    return createErrorResponse("Missing authorization code", 400);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: context.env.GOOGLE_CLIENT_ID,
        client_secret: context.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${context.env.APP_ORIGIN}/api/auth/google/callback`,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      return createErrorResponse("Failed to exchange token", 400);
    }

    const { access_token } = (await tokenResponse.json()) as { access_token: string };

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      return createErrorResponse("Failed to get user info", 400);
    }

    const googleUser = (await userInfoResponse.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };

    // Get or create user
    let user = await getUserByGoogleSub(context.env.DB, googleUser.sub);
    if (!user) {
      user = await createUser(context.env.DB, {
        email: googleUser.email,
        name: googleUser.name,
        image: googleUser.picture,
        auth_method: "google_oauth",
        google_sub: googleUser.sub,
      });
    }

    // Create session
    const sessionId = await createSession(context.env.DB, user.id, 30);
    const setCookieHeader = setSessionCookie(sessionId);

    // Redirect to dashboard
    return createRedirectResponse("/dashboard", setCookieHeader);
  } catch (error) {
    console.error(error);
    return createErrorResponse("Internal server error", 500);
  }
};
