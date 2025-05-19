export async function apiFetch(endpoint: string, token: string, options: RequestInit = {}) : Promise<Response> {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData || "Erro na requisição");
    }

    return await response;
  } catch (error: unknown) {
      console.error("Request returned an error:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Error when making request");
      } else {
        throw new Error("Error when making request: " + String(error));
      }
    }
}
