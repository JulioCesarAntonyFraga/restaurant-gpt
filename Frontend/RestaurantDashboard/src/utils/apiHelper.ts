export async function apiFetch(endpoint: string, token: string, options: RequestInit = {}) : Promise<Response> {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
