export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Combina headers padrão com os passados via options
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Erro na requisição');
    }

    return await response.json();
  } catch (error: unknown) {
  console.error("Erro ao fazer requisição:", error);

  if (error instanceof Error) {
    throw new Error(error.message || "Erro desconhecido ao se comunicar com a API");
  } else {
    throw new Error("Erro desconhecido ao se comunicar com a API");
  }
}

}
