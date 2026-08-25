import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { persistOperatorFromSession } from "@/lib/operator-session";

export const auth0 = new Auth0Client({
  enableConnectAccountEndpoint: true,
  authorizationParameters: {
    scope: "openid profile email offline_access",
  },
  async onCallback(error, context, session) {
    if (!error && session) {
      try {
        await persistOperatorFromSession(session);
      } catch (persistError) {
        console.error("[auth0] persist operator session failed", persistError);
      }
    }

    const appBaseUrl = context.appBaseUrl ?? process.env.APP_BASE_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL(context.returnTo ?? "/admin", appBaseUrl));
  },
});
