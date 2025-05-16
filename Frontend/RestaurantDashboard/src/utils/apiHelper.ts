export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
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
      throw new Error(errorData.message || "Erro na requisição");
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erro ao fazer requisição:", error);
      throw new Error(error.message);
    } else {
      console.error("Erro desconhecido ao fazer requisição:", error);
      throw new Error("Erro desconhecido ao se comunicar com a API");
    }
  }
}
