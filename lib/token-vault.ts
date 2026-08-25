import { auth0 } from "@/lib/auth0";
import { getDestinationConnection } from "@/lib/config";
import { ensureBoothSettings } from "@/lib/db/queries";
import { isAllowedOperator } from "@/lib/operator-access";
import {
  readStoredOperatorRefreshToken,
  writeStoredOperatorRefreshToken,
} from "@/lib/operator-session";

type ConnectionToken = {
  token: string;
  expiresAt?: number;
};

export async function getOperatorConnectionToken(
  connection = getDestinationConnection(),
): Promise<ConnectionToken | null> {
  const settings = await ensureBoothSettings();
  const session = await auth0.getSession();
  const sessionUser = session?.user;
  const sessionSub = sessionUser?.sub;
  const sessionIsStoredOperator =
    Boolean(sessionSub) &&
    isAllowedOperator(sessionUser) &&
    (!settings.operatorSub || settings.operatorSub === sessionSub);

  if (sessionIsStoredOperator) {
    try {
      const fromSession = await auth0.getAccessTokenForConnection({ connection });
      if (fromSession.token) {
        return fromSession;
      }
    } catch {
      // Fall through to the stored operator refresh token.
    }
  }

  const refreshToken = await readStoredOperatorRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    return await exchangeRefreshTokenForConnection(refreshToken, connection);
  } catch (error) {
    console.error("[token-vault] refresh-token exchange failed", error);
    return null;
  }
}

export async function isDestinationConnected(
  connection = getDestinationConnection(),
) {
  const token = await getOperatorConnectionToken(connection);
  return Boolean(token?.token);
}

async function exchangeRefreshTokenForConnection(
  refreshToken: string,
  connection: string,
): Promise<ConnectionToken> {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  if (!domain || !clientId || !clientSecret) {
    throw new Error("Auth0 client env is incomplete for Token Vault exchange");
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type:
        "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
      client_id: clientId,
      client_secret: clientSecret,
      subject_token: refreshToken,
      subject_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
      requested_token_type:
        "http://auth0.com/oauth/token-type/federated-connection-access-token",
      connection,
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description || payload.error || "Token Vault exchange failed",
    );
  }

  if (payload.refresh_token) {
    await writeStoredOperatorRefreshToken(payload.refresh_token);
  }

  return {
    token: payload.access_token,
    expiresAt: payload.expires_in
      ? Math.floor(Date.now() / 1000) + payload.expires_in
      : undefined,
  };
}
