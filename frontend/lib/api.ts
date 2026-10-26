
const API = process.env.NEXT_PUBLIC_API_URL;

export interface LoanApplicationSummary {
  id: string;
  loanAmount: number;
  loanMonths: number;
  interestRate: number;
  creditScore: number;
  eligibility: number;
  risk: string;
  status: string;
  paymentStatus?: string;
}

export type OCRDocumentType =
  | "AADHAAR"
  | "PAN"
  | "SALARY_SLIP"
  | "BANK_PASSBOOK"
  | "PROPERTY_DOCUMENT"
  | "GOLD_DOCUMENT"
  | "SELFIE";

interface PaymentOrderResponse {
  success: boolean;
  message?: string;
  keyId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
}

interface PaymentVerificationResponse {
  success: boolean;
  message?: string;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

function getApiUrl(path: string): string {
  if (!API) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Check your frontend .env file."
    );
  }

  return `${API.replace(/\/+$/, "")}${path}`;
}

async function readResponse<T = unknown>(res: Response): Promise<T> {
  const text = await res.text();

  let result: unknown;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {
      message: text || "Invalid response received from server.",
    };
  }

  const resultRecord =
    result && typeof result === "object"
      ? result as Record<string, unknown>
      : {};

  if (!res.ok || resultRecord.success === false) {
    throw new Error(
      (typeof resultRecord.message === "string" &&
        resultRecord.message) ||
        (typeof resultRecord.error === "string" &&
          resultRecord.error) ||
        `API request failed with status ${res.status}.`
    );
  }

  return result as T;
}

/* ---------------- APPLY LOAN ---------------- */

export async function applyLoan(data: Record<string, unknown>) {
  const res = await fetch(getApiUrl("/api/loan/apply"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await readResponse<{
    success?: unknown;
    message?: unknown;
    loan?: {
      id?: unknown;
    };
  }>(res);

  if (
    result.success !== true ||
    typeof result.loan?.id !== "string" ||
    result.loan.id.length === 0
  ) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "The server did not confirm that the loan application was saved."
    );
  }

  return result as {
    success: true;
    message?: string;
    loan: { id: string };
  };
}

/* ---------------- DOCUMENT OCR ---------------- */

export async function uploadDocument(
  file: File,
  expectedType: OCRDocumentType
) {
  const form = new FormData();
  form.append("document", file);
  form.append("expectedType", expectedType);

  const res = await fetch(getApiUrl("/api/ocr/upload"), {
    method: "POST",
    body: form,
  });

  return readResponse(res);
}

/* ---------------- GET LOANS ---------------- */

export async function getLoans() {
  const res = await fetch(getApiUrl("/api/loan"));
  return readResponse(res);
}

/* ---------------- APPROVE LOAN ---------------- */

export async function approveLoan(id: string) {
  const res = await fetch(
    getApiUrl(`/api/loan/approve/${encodeURIComponent(id)}`),
    { method: "PATCH" }
  );

  return readResponse(res);
}

/* ---------------- REJECT LOAN ---------------- */

export async function rejectLoan(id: string) {
  const res = await fetch(
    getApiUrl(`/api/loan/reject/${encodeURIComponent(id)}`),
    { method: "PATCH" }
  );

  return readResponse(res);
}

/* ---------------- GET LOAN BY EMAIL ---------------- */

export async function getLoanByEmail(
  email: string
): Promise<LoanApplicationSummary> {
  const res = await fetch(
    getApiUrl(`/api/loan/${encodeURIComponent(email)}`)
  );

  return readResponse<LoanApplicationSummary>(res);
}

/* ---------------- CALCULATE LOAN RISK ---------------- */

export async function calculateLoanRisk(data: {
  monthlyIncome: number;
  loanAmount: number;
  loanMonths: number;
  creditScore?: number;
  occupation: string;
  documentsVerified: boolean;
  bankVerified: boolean;
  fraudScore?: number;
  fraudRisk?: number | "LOW" | "MEDIUM" | "HIGH";
  fraudFlags?: string[];
}, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(getApiUrl("/api/loan/risk"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal,
  });

  const result = await readResponse<{
    success: boolean;
    risk?: unknown;
  }>(res);

  if (result.success !== true || !result.risk) {
    throw new Error(
      "The loan risk API returned an incomplete response."
    );
  }

  return result.risk;
}

/* ---------------- ADMIN REGISTRATION ---------------- */

export async function registerAdmin(
  name: string,
  email: string
) {
  const res = await fetch(getApiUrl("/api/admin/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  return readResponse(res);
}

/* ---------------- REQUEST ADMIN OTP ---------------- */

export async function requestAdminOTP(email: string) {
  const res = await fetch(
    getApiUrl("/api/admin/request-otp"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  return readResponse(res);
}

/* ---------------- VERIFY ADMIN OTP ---------------- */

export async function verifyAdminOTP(
  email: string,
  otp: string
) {
  const res = await fetch(
    getApiUrl("/api/admin/verify-otp"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    }
  );

  return readResponse<AdminLoginResponse>(res);
}

/* ---------------- CREATE RAZORPAY ORDER ---------------- */

export async function createPaymentOrder(loanId: string) {
  const res = await fetch(
    getApiUrl("/api/payment/create-order"),
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
    }
  );

  const result = await readResponse<PaymentOrderResponse>(res);
  if (
    result.success !== true ||
    typeof result.keyId !== "string" ||
    !result.keyId ||
    typeof result.order?.id !== "string" ||
    !result.order.id ||
    result.order.amount !== 99900 ||
    result.order.currency !== "INR"
  ) {
    throw new Error(
      "The server returned an invalid payment order. No payment was started."
    );
  }

  return result;
}

/* ---------------- VERIFY RAZORPAY PAYMENT ---------------- */

export async function verifyPayment(data: {
  loanId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await fetch(
    getApiUrl("/api/payment/verify"),
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return readResponse<PaymentVerificationResponse>(res);
}
