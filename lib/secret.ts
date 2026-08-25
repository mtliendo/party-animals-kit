import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function keyMaterial() {
  const secret = process.env.AUTH0_SECRET?.trim();
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const key = keyMaterial();
  if (!key) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string) {
  if (!value.startsWith(PREFIX)) {
    return null;
  }
  const key = keyMaterial();
  if (!key) return null;
  const [ivPart, tagPart, dataPart] = value.slice(PREFIX.length).split(".");
  if (!ivPart || !tagPart || !dataPart) return null;
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
