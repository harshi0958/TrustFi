import assert from "node:assert/strict";
import test from "node:test";

import {
  createMockOtp,
  getOtpProvider,
  isLoopbackAddress,
  OtpConfigurationError,
  verifyMockOtp,
} from "./otp.service";

test("uses Twilio by default and permits mock mode only outside production", () => {
  assert.equal(getOtpProvider({}), "twilio");
  assert.equal(
    getOtpProvider({ OTP_PROVIDER: "mock", NODE_ENV: "development" }),
    "mock"
  );
  assert.throws(
    () => getOtpProvider({ OTP_PROVIDER: "mock", NODE_ENV: "production" }),
    OtpConfigurationError
  );
  assert.throws(
    () => getOtpProvider({ OTP_PROVIDER: "mock", NODE_ENV: "Production" }),
    OtpConfigurationError
  );
});

test("permits returning a demo code only to loopback callers", () => {
  assert.equal(isLoopbackAddress("127.0.0.1"), true);
  assert.equal(isLoopbackAddress("::1"), true);
  assert.equal(isLoopbackAddress("::ffff:127.0.0.1"), true);
  assert.equal(isLoopbackAddress("192.168.1.10"), false);
  assert.equal(isLoopbackAddress(undefined), false);
});

test("approves the generated mock OTP once", () => {
  const userId = "mock-otp-success";
  const created = createMockOtp(userId, 1_000);

  assert.equal(created.status, "created");
  if (created.status !== "created") return;

  assert.match(created.code, /^\d{6}$/);
  assert.equal(created.expiresInSeconds, 300);
  assert.equal(verifyMockOtp(userId, created.code, 1_001), "approved");
  assert.equal(verifyMockOtp(userId, created.code, 1_002), "not_found");
});

test("rejects an incorrect code without preventing a later correct code", () => {
  const userId = "mock-otp-incorrect";
  const created = createMockOtp(userId, 2_000);

  assert.equal(created.status, "created");
  if (created.status !== "created") return;

  assert.equal(verifyMockOtp(userId, "000000", 2_001), "invalid");
  assert.equal(verifyMockOtp(userId, created.code, 2_002), "approved");
});

test("expires mock OTPs", () => {
  const userId = "mock-otp-expired";
  const created = createMockOtp(userId, 3_000);

  assert.equal(created.status, "created");
  if (created.status !== "created") return;

  assert.equal(verifyMockOtp(userId, created.code, 303_000), "expired");
});

test("locks verification after five incorrect attempts", () => {
  const userId = "mock-otp-attempt-limit";
  const created = createMockOtp(userId, 4_000);

  assert.equal(created.status, "created");
  if (created.status !== "created") return;

  for (let attempt = 1; attempt < 5; attempt += 1) {
    assert.equal(
      verifyMockOtp(userId, "000000", 4_000 + attempt),
      "invalid"
    );
  }

  assert.equal(verifyMockOtp(userId, "000000", 4_005), "locked");
  assert.equal(verifyMockOtp(userId, created.code, 4_006), "locked");
});

test("rate limits resend requests and allows a resend after the cooldown", () => {
  const userId = "mock-otp-rate-limit";
  const created = createMockOtp(userId, 5_000);

  assert.equal(created.status, "created");
  assert.equal(createMockOtp(userId, 64_999).status, "rate_limited");
  assert.equal(createMockOtp(userId, 65_000).status, "created");
});
