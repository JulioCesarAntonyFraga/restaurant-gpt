export function formatTimestamp(timestamp: number): string {
    if (!timestamp) return "-";
  
    return new Date(timestamp * 1000).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  