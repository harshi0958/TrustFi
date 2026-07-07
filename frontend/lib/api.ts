const API = process.env.NEXT_PUBLIC_API_URL;

export async function applyLoan(data: any) {
  const res = await fetch(`${API}/api/loan/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
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