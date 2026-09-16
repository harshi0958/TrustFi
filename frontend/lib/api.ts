const API = process.env.NEXT_PUBLIC_API_URL;

export async function applyLoan(data: any) {
  const res = await fetch(`${API}/api/loan/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  console.log("Status:", res.status);
  console.log("Response:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
}

export async function uploadDocument(file: File) {
  const form = new FormData();

  form.append("document", file);

  const res = await fetch(`${API}/api/ocr/upload`, {
    method: "POST",
    body: form,
  });

  return res.json();
}
export async function getLoans() {
  const res = await fetch(`${API}/api/loan`);

  return res.json();
}
export async function approveLoan(id: string) {
  const res = await fetch(`${API}/api/loan/approve/${id}`, {
    method: "PATCH",
  });

  return res.json();
}
export async function getLoanByEmail(email: string) {
  const res = await fetch(`${API}/api/loan/${email}`);

  return res.json();
}
export async function calculateLoanRisk(data: any) {
  const res = await fetch(`${API}/api/loan/risk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  console.log("Risk API Status:", res.status);
  console.log("Risk API Response:", result);

  if (!res.ok || !result.success) {
    throw new Error(
      result.message || "Risk calculation failed"
    );
  }

  return result.risk;
}
export async function registerAdmin(
  name: string,
  email: string
) {
  const res = await fetch(
    `${API}/api/admin/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    }
  );

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(
      result.message ||
        "Admin registration failed."
    );
  }

  return result;
}
export async function requestAdminOTP(
  email: string
) {
  const res = await fetch(
    `${API}/api/admin/request-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to send OTP."
    );
  }

  return result;
}

export async function verifyAdminOTP(
  email: string,
  otp: string
) {
  const res = await fetch(
    `${API}/api/admin/verify-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(
      result.message ||
        "OTP verification failed."
    );
  }

  return result;
}

export async function createPaymentOrder(
  loanId: string
) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(
    `${API}/api/payment/create-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loanId,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "Failed to create payment order."
    );
  }

  return data;
}

export async function verifyPayment(data: {
  loanId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(
    `${API}/api/payment/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(
      result.message ||
        "Payment verification failed."
    );
  }

  return result;
}