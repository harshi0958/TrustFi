import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  customerOwnsLoan,
  decidePaymentOrder,
  decidePaymentVerification,
  getRazorpayConfiguration,
  getSafeRazorpayFailure,
  isCapturedPaymentForExpectedOrder,
  PAYMENT_AMOUNT_INR,
  PAYMENT_AMOUNT_PAISE,
  PaymentConfigurationError,
  verifyRazorpaySignature,
} from "./payment.service";

test("defines the ₹999 processing fee as 99900 paise", () => {
  assert.equal(PAYMENT_AMOUNT_INR, 999);
  assert.equal(PAYMENT_AMOUNT_PAISE, 99900);
});

test("reports missing Razorpay environment variables by name only", () => {
  assert.throws(
    () => getRazorpayConfiguration({}),
    (error: unknown) =>
      error instanceof PaymentConfigurationError &&
      error.message.includes("RAZORPAY_KEY_ID") &&
      error.message.includes("RAZORPAY_KEY_SECRET")
  );
});

test("rejects invalid Razorpay key IDs without exposing secret material", () => {
  assert.throws(
    () =>
      getRazorpayConfiguration({
        RAZORPAY_KEY_ID: "not-a-key",
        RAZORPAY_KEY_SECRET: "private-secret",
      }),
    /valid Razorpay Test Mode or Live Mode key ID/
  );
});

test("accepts only captured INR payments for the expected 99900-paise order", () => {
  const capturedPayment = {
    order_id: "order_test",
    amount: 99900,
    currency: "INR",
    status: "captured",
  };

  assert.equal(
    isCapturedPaymentForExpectedOrder(capturedPayment, "order_test"),
    true
  );
  assert.equal(
    isCapturedPaymentForExpectedOrder(
      { ...capturedPayment, status: "authorized" },
      "order_test"
    ),
    false
  );
  assert.equal(
    isCapturedPaymentForExpectedOrder(
      { ...capturedPayment, order_id: "other_order" },
      "order_test"
    ),
    false
  );
  assert.equal(
    isCapturedPaymentForExpectedOrder(
      { ...capturedPayment, amount: 100 },
      "order_test"
    ),
    false
  );
});

test("does not expose upstream details or secrets for Razorpay errors", () => {
  const failure = getSafeRazorpayFailure(
    {
      message: "sensitive detail",
      error: {
        code: "BAD_REQUEST_ERROR",
        description:
          "Invalid key_secret=private-secret for field receipt\r\n",
        metadata: { field: "receipt" },
      },
    },
    "create"
  );

  assert.equal(failure.status, 502);
  assert.match(failure.message, /BAD_REQUEST_ERROR/);
  assert.doesNotMatch(failure.message, /private-secret|sensitive detail/);
  assert.deepEqual(failure.diagnostics, {
    code: "BAD_REQUEST_ERROR",
    description: "Invalid key_secret=[REDACTED] for field receipt",
    field: "receipt",
  });
  assert.doesNotMatch(
    JSON.stringify(failure.diagnostics),
    /private-secret|sensitive detail/
  );
});

test("allows payment only for the authenticated loan owner", () => {
  const customer = { id: "user-1", email: "person@example.test" };

  assert.equal(
    customerOwnsLoan(
      { userId: null, email: "PERSON@example.test" },
      customer
    ),
    true
  );
  assert.equal(
    customerOwnsLoan(
      { userId: "another-user", email: "person@example.test" },
      customer
    ),
    false
  );
  assert.equal(
    customerOwnsLoan(
      { userId: null, email: "other@example.test" },
      customer
    ),
    false
  );
});

test("reuses a pending order after checkout cancellation and never creates for a paid or unapproved loan", () => {
  assert.equal(decidePaymentOrder("APPROVED", "PENDING", true), "REUSE");
  assert.equal(decidePaymentOrder("APPROVED", "PENDING", false), "CREATE");
  assert.equal(decidePaymentOrder("APPROVED", "FAILED", false), "CREATE");
  assert.equal(decidePaymentOrder("APPROVED", "PAID", true), "ALREADY_PAID");
  assert.equal(decidePaymentOrder("PENDING", "NOT_REQUIRED", false), "NOT_APPROVED");
});

test("makes duplicate payment verification idempotent and rejects conflicting activation", () => {
  assert.equal(
    decidePaymentVerification("ACTIVE", "PAID", "pay_1", "pay_1"),
    "ALREADY_ACTIVATED"
  );
  assert.equal(
    decidePaymentVerification("ACTIVE", "PAID", "pay_1", "pay_2"),
    "ALREADY_PAID"
  );
  assert.equal(
    decidePaymentVerification("APPROVED", "PENDING", null, "pay_1"),
    "VERIFY"
  );
  assert.equal(
    decidePaymentVerification("APPROVED", "FAILED", null, "pay_1"),
    "NOT_AWAITING_PAYMENT"
  );
});

test("verifies Razorpay signatures and rejects malformed or altered signatures", () => {
  const secret = "unit-test-secret";
  const orderId = "order_test";
  const paymentId = "pay_test";
  const signature = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.equal(
    verifyRazorpaySignature(orderId, paymentId, signature, secret),
    true
  );
  assert.equal(
    verifyRazorpaySignature(orderId, paymentId, `${signature.slice(1)}0`, secret),
    false
  );
  assert.equal(
    verifyRazorpaySignature(orderId, paymentId, "not-a-signature", secret),
    false
  );
});
