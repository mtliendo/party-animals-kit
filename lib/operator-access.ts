export type OperatorIdentity = {
  sub?: string | null;
  email?: string | null;
  [key: string]: unknown;
};

export function getAllowedOperatorEmails() {
  return (process.env.ALLOWED_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function getOperatorRole() {
  return process.env.AUTH0_OPERATOR_ROLE?.trim() || "";
}

export function getRolesClaim() {
  return process.env.AUTH0_ROLES_CLAIM?.trim() || "roles";
}

export function isOperatorGateConfigured() {
  return getAllowedOperatorEmails().length > 0 || Boolean(getOperatorRole());
}

export function isAllowedOperator(user?: OperatorIdentity | null) {
  if (!user || !isOperatorGateConfigured()) {
    return false;
  }

  const emails = getAllowedOperatorEmails();
  const email = user.email?.trim().toLowerCase();
  const emailAllowed = emails.length > 0 && Boolean(email && emails.includes(email));

  const role = getOperatorRole();
  const roleAllowed = role ? userHasRole(user, role) : false;

  if (emails.length > 0 && role) {
    return emailAllowed || roleAllowed;
  }
  if (emails.length > 0) {
    return emailAllowed;
  }
  return roleAllowed;
}

function userHasRole(user: OperatorIdentity, role: string) {
  const claim = getRolesClaim();
  const bags = [user[claim], user.roles, user["https://party-animals/roles"]];
  return bags.some((bag) => asRoleList(bag).includes(role));
}

function asRoleList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}
