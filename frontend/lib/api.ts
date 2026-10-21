
const API = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(path: string): string {
  if (!API) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Check your frontend .env file."
    );
  }

  return `${API.replace(/\/+$/, "")}${path}`;
}

async function readResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();

  let result: any;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {
      message: text || "Invalid response received from server.",
    };
  }

  if (!res.ok || result.success === false) {
    throw new Error(
      result.message ||
        result.error ||
        `API request failed with status ${res.status}.`
    );
  }

  return result as T;
}

/* ---------------- APPLY LOAN ---------------- */

export async function applyLoan(data: any) {
  const res = await fetch(getApiUrl("/api/loan/apply"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return readResponse(res);
}

/* ---------------- DOCUMENT OCR ---------------- */

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("document", file);

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

export async function getLoanByEmail(email: string) {
  const res = await fetch(
    getApiUrl(`/api/loan/${encodeURIComponent(email)}`)
  );

  return readResponse(res);
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
}) {
  const res = await fetch(getApiUrl("/api/loan/risk"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await readResponse<{
    success: boolean;
    risk: any;
  }>(res);

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

  return readResponse(res);
}

/* ---------------- CREATE RAZORPAY ORDER ---------------- */

export async function createPaymentOrder(loanId: string) {
  const res = await fetch(
    getApiUrl("/api/payment/create-order"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
    }
  );

  return readResponse(res);
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return readResponse(res);
}
