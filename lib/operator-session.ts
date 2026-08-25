import type { SessionData } from "@auth0/nextjs-auth0/types";
import { isAllowedOperator } from "@/lib/operator-access";
import { ensureBoothSettings, updateBoothSettings } from "@/lib/db/queries";
import { decryptSecret, encryptSecret } from "@/lib/secret";

export async function persistOperatorFromSession(session: SessionData) {
  if (!isAllowedOperator(session.user)) {
    return;
  }

  const sub = session.user.sub;
  if (!sub) return;

  const settings = await ensureBoothSettings();
  if (settings.operatorSub && settings.operatorSub !== sub) {
    return;
  }

  const refreshToken = session.tokenSet.refreshToken;
  const encrypted = refreshToken ? encryptSecret(refreshToken) : null;

  await updateBoothSettings({
    operatorSub: sub,
    ...(encrypted ? { operatorRefreshToken: encrypted } : {}),
  });
}

export async function readStoredOperatorRefreshToken() {
  const settings = await ensureBoothSettings();
  if (!settings.operatorRefreshToken) return null;
  return decryptSecret(settings.operatorRefreshToken);
}

export async function writeStoredOperatorRefreshToken(refreshToken: string) {
  const encrypted = encryptSecret(refreshToken);
  if (!encrypted) return;
  await updateBoothSettings({ operatorRefreshToken: encrypted });
}
