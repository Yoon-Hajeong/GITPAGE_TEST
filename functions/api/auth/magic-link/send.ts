import { createJsonResponse, createErrorResponse } from "../../_lib/session";
import { getUserByEmail, createMagicLinkToken, createUser } from "../../_lib/db";

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }

  try {
    const { email } = (await context.request.json()) as { email?: string };

    if (!email || !email.includes("@")) {
      return createErrorResponse("Invalid email", 400);
    }

    // Get or create user
    let user = await getUserByEmail(context.env.DB, email);
    if (!user) {
      user = await createUser(context.env.DB, {
        email,
        auth_method: "magic_link",
      });
    }

    // Create magic link token
    const token = await createMagicLinkToken(context.env.DB, email, 15);

    // Send email via Resend
    const verifyUrl = new URL(context.request.url);
    verifyUrl.pathname = "/api/auth/magic-link/verify";
    verifyUrl.search = `token=${token}`;

    const emailHtml = `
      <h1>Sign in to your account</h1>
      <p>Click the link below to sign in:</p>
      <a href="${verifyUrl.toString()}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
        Sign in
      </a>
      <p>This link expires in 15 minutes.</p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Sign in to your account",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      return createErrorResponse("Failed to send email", 500);
    }

    return createJsonResponse({ success: true });
  } catch (error) {
    console.error(error);
    return createErrorResponse("Internal server error", 500);
  }
};
