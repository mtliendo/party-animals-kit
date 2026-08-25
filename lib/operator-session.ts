import type { SessionData } from "@auth0/nextjs-auth0/types";
import { ensureBoothSettings, updateBoothSettings } from "@/lib/db/queries";

export async function persistOperatorFromSession(session: SessionData) {
  const refreshToken = session.tokenSet.refreshToken;
  const sub = session.user.sub;
  if (!sub) return;

  await ensureBoothSettings();
  await updateBoothSettings({
    operatorSub: sub,
    ...(refreshToken ? { operatorRefreshToken: refreshToken } : {}),
  });
}
