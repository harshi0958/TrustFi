import { createHmac, timingSafeEqual } from "node:crypto";

export const PAYMENT_AMOUNT_INR = 999;
export const PAYMENT_AMOUNT_PAISE = PAYMENT_AMOUNT_INR * 100;

export interface RazorpayConfiguration {
  keyId: string;
  keySecret: string;
}

export interface PaymentCustomer {
  id: string;
  email: string;
}

export interface LoanPaymentOwner {
  userId: string | null;
  email: string;
}

export interface RazorpayPaymentConfirmation {
  order_id: string;
  amount: number | string;
  currency: string;
  status: string;
}

export type PaymentOrderDecision =
  | "CREATE"
  | "REUSE"
  | "NOT_APPROVED"
  | "ALREADY_PAID";

export type PaymentVerificationDecision =
  | "VERIFY"
  | "ALREADY_ACTIVATED"
  | "ALREADY_PAID"
  | "NOT_AWAITING_PAYMENT";

export class PaymentConfigurationError extends Error {}

export function getRazorpayConfiguration(
  environment: NodeJS.ProcessEnv = process.env
): RazorpayConfiguration {
  const keyId = environment.RAZORPAY_KEY_ID?.trim();
  const keySecret = environment.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new PaymentConfigurationError(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend environment."
    );
  }

  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
    throw new PaymentConfigurationError(
      "RAZORPAY_KEY_ID must be a valid Razorpay Test Mode or Live Mode key ID."
    );
  }

  return { keyId, keySecret };
}

export function customerOwnsLoan(
  loan: LoanPaymentOwner,
  customer: PaymentCustomer
): boolean {
  if (loan.userId) return loan.userId === customer.id;

  return loan.email.trim().toLowerCase() === customer.email.trim().toLowerCase();
}

export function decidePaymentOrder(
  loanStatus: string,
  paymentStatus: string,
  hasOrderId: boolean
): PaymentOrderDecision {
  if (loanStatus !== "APPROVED") return "NOT_APPROVED";
  if (paymentStatus === "PAID") return "ALREADY_PAID";
  if (paymentStatus === "PENDING" && hasOrderId) return "REUSE";
  return "CREATE";
}

export function decidePaymentVerification(
  loanStatus: string,
  paymentStatus: string,
  storedPaymentId: string | null,
  submittedPaymentId: string
): PaymentVerificationDecision {
  if (
    paymentStatus === "PAID" &&
    storedPaymentId === submittedPaymentId
  ) {
    return "ALREADY_ACTIVATED";
  }
  if (paymentStatus === "PAID") return "ALREADY_PAID";
  if (loanStatus !== "APPROVED" || paymentStatus !== "PENDING") {
    return "NOT_AWAITING_PAYMENT";
  }
  return "VERIFY";
}

export function isCapturedPaymentForExpectedOrder(
  payment: RazorpayPaymentConfirmation,
  expectedOrderId: string
): boolean {
  return (
    payment.order_id === expectedOrderId &&
    Number(payment.amount) === PAYMENT_AMOUNT_PAISE &&
    payment.currency === "INR" &&
    payment.status === "captured"
  );
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  if (!/^[a-f\d]{64}$/i.test(signature)) return false;

  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

export function getSafeRazorpayFailure(
  error: unknown,
  action: "create" | "fetch"
): {
  status: number;
  message: string;
  diagnostics: {
    code?: string;
    description?: string;
    field?: string;
  };
} {
  const errorObject =
    error &&
    typeof error === "object" &&
    "error" in error &&
    error.error &&
    typeof error.error === "object"
      ? error.error
      : null;

  const code =
    errorObject &&
    "code" in errorObject &&
    typeof errorObject.code === "string" &&
    /^[A-Z0-9_]{1,64}$/.test(errorObject.code)
      ? errorObject.code
      : undefined;
  const description =
    errorObject &&
    "description" in errorObject &&
    typeof errorObject.description === "string"
      ? sanitizeRazorpayDiagnostic(errorObject.description)
      : undefined;

  const metadata =
    errorObject && "metadata" in errorObject ? errorObject.metadata : null;
  const metadataObject =
    metadata && typeof metadata === "object" ? metadata : null;
  const rawField =
    errorObject && "field" in errorObject
      ? errorObject.field
      : metadataObject && "field" in metadataObject
        ? metadataObject.field
        : undefined;
  const field =
    typeof rawField === "string" &&
    /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(rawField)
      ? rawField
      : undefined;

  return {
    status: 502,
    message:
      `Razorpay could not ${action} the payment order${code ? ` (${code})` : ""}. ` +
      "Check the backend Razorpay key pair, Test/Live mode, and Razorpay account status.",
    diagnostics: {
      ...(code ? { code } : {}),
      ...(description ? { description } : {}),
      ...(field ? { field } : {}),
    },
  };
}

function sanitizeRazorpayDiagnostic(value: string): string | undefined {
  const sanitized = value
    .replace(/[\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/rzp_(?:test|live)_[A-Za-z0-9]+/gi, "[REDACTED]")
    .replace(
      /\b(key[_\s-]?secret|password|authorization|access[_\s-]?token)\b\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]"
    )
    .replace(/\bBearer\s+\S+/gi, "Bearer [REDACTED]");

  return sanitized ? sanitized.slice(0, 300) : undefined;
}
