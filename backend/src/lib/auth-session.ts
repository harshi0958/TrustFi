
import {
  createHmac,
  timingSafeEqual,
} from "crypto";

const COOKIE_NAME = "trustfi_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

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

export function createSessionToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");

  const payload: SessionPayload = {
    sub: userId,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const unsignedToken = `${header}.${encodedPayload}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifySessionToken(
  token: string
): SessionPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;

    const header = JSON.parse(
      Buffer.from(headerPart, "base64url").toString("utf8")
    );

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

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
    ) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

export function getSessionCookieOptions() {
  const production = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: SESSION_DURATION_SECONDS * 1000,
  };
}
