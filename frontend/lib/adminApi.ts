const API = process.env.NEXT_PUBLIC_API_URL;

export function adminFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  if (!API) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Check your frontend environment."
    );
  }

  const token = localStorage.getItem("adminToken");
  if (!token) {
    throw new Error("Administrator session has expired. Please sign in again.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${API.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
