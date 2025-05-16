
import { useAuth } from "./authContext";
export async function apiFetch(endpoint: string, options: RequestInit = {}) {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;


  const {token} = useAuth(); 


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

    // Se não tiver conteúdo, retorna null (ou pode retornar {} dependendo do uso)
    if (response.status === 204) {
      return null;
    }

    // Tenta ler o corpo se tiver conteúdo
    const text = await response.text();

    // Se o corpo estiver vazio, retorna null ou {}
    if (!text) {
      return null;
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.message || "Erro na requisição");
    }

    return data;
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
