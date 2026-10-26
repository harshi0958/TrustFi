import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const SESSION_DURATION_SECONDS = 60 * 60 * 24;

interface AdminSessionPayload {
  sub: string;
  role: "ADMIN";
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 bytes."
    );
  }

  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

export function createAdminSessionToken(adminId: string): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const payload: AdminSessionPayload = {
    sub: adminId,
    role: "ADMIN",
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");
  const unsignedToken = `${header}.${encodedPayload}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAdminSessionToken(
  token: string
): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;
    const header = JSON.parse(
      Buffer.from(headerPart, "base64url").toString("utf8")
    );
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const unsignedToken = `${headerPart}.${payloadPart}`;
    const expected = Buffer.from(sign(unsignedToken));
    const received = Buffer.from(signaturePart);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8")
    ) as Partial<AdminSessionPayload>;

    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      payload.role !== "ADMIN" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}
