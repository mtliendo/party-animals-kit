import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { getAllowedOperatorEmails } from "@/lib/config";
import { persistOperatorFromSession } from "@/lib/operator-session";

function isAllowedOperator(email?: string | null) {
  const allowed = getAllowedOperatorEmails();
  if (allowed.length === 0) return true;
  return Boolean(email && allowed.includes(email.toLowerCase()));
}

export async function requireOperator() {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login?returnTo=/admin");
  }

  if (!isAllowedOperator(session.user.email)) {
    redirect("/admin/forbidden");
  }

  try {
    await persistOperatorFromSession(session);
  } catch (error) {
    console.error("[operator] persist on admin load failed", error);
  }

  return session;
}

export async function requireOperatorApi() {
  const session = await auth0.getSession();
  if (!session) {
    return { session: null, error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAllowedOperator(session.user.email)) {
    return { session: null, error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }
  try {
    await persistOperatorFromSession(session);
  } catch (error) {
    console.error("[operator] persist on admin API failed", error);
  }
  return { session, error: null };
}
