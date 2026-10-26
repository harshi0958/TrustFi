import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

const MOCK_OTP_TTL_MS = 5 * 60 * 1000;
const MOCK_OTP_RESEND_INTERVAL_MS = 60 * 1000;
const MOCK_OTP_MAX_ATTEMPTS = 5;
const mockOtpHashKey = randomBytes(32);

interface MockOtpRecord {
  hash: Buffer;
  expiresAt: number;
  nextSendAt: number;
  attempts: number;
}

const mockOtpRecords = new Map<string, MockOtpRecord>();

export class OtpConfigurationError extends Error {}

export type OtpProvider = "mock" | "twilio";

export function getOtpProvider(
  environment: NodeJS.ProcessEnv = process.env
): OtpProvider {
  if (environment.OTP_PROVIDER !== "mock") return "twilio";

  if (environment.NODE_ENV?.trim().toLowerCase() === "production") {
    throw new OtpConfigurationError(
      "The mock OTP provider cannot be used in production."
    );
  }

  return "mock";
}

export function isLoopbackAddress(address: string | undefined): boolean {
  return Boolean(
    address &&
      (address === "::1" ||
        address.startsWith("127.") ||
        address.startsWith("::ffff:127."))
  );
}

export function createMockOtp(
  userId: string,
  now = Date.now()
):
  | { status: "created"; code: string; expiresInSeconds: number }
  | { status: "rate_limited" } {
  const existing = mockOtpRecords.get(userId);
  if (existing && now < existing.nextSendAt) {
    return { status: "rate_limited" };
  }

  const code = randomInt(100000, 1000000).toString();
  mockOtpRecords.set(userId, {
    hash: hashMockOtp(userId, code),
    expiresAt: now + MOCK_OTP_TTL_MS,
    nextSendAt: now + MOCK_OTP_RESEND_INTERVAL_MS,
    attempts: 0,
  });

  return {
    status: "created",
    code,
    expiresInSeconds: MOCK_OTP_TTL_MS / 1000,
  };
}

export type MockOtpVerification =
  | "approved"
  | "invalid"
  | "expired"
  | "locked"
  | "not_found";

export function verifyMockOtp(
  userId: string,
  code: string,
  now = Date.now()
): MockOtpVerification {
  const record = mockOtpRecords.get(userId);
  if (!record) return "not_found";

  if (now >= record.expiresAt) {
    mockOtpRecords.delete(userId);
    return "expired";
  }

  if (record.attempts >= MOCK_OTP_MAX_ATTEMPTS) {
    return "locked";
  }

  record.attempts += 1;
  const submittedHash = hashMockOtp(userId, code);
  const matches =
    submittedHash.length === record.hash.length &&
    timingSafeEqual(submittedHash, record.hash);

  if (matches) {
    mockOtpRecords.delete(userId);
    return "approved";
  }

  if (record.attempts >= MOCK_OTP_MAX_ATTEMPTS) {
    return "locked";
  }

  return "invalid";
}

function hashMockOtp(userId: string, code: string): Buffer {
  return createHmac("sha256", mockOtpHashKey)
    .update(`${userId}:${code}`)
    .digest();
}
