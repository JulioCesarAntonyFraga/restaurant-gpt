// src/pages/Checkout.tsx
import React, { useEffect, useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// Inicializa o Mercado Pago com a chave pública do ambiente
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY as string);

interface PreferenceResponse {
  id: string;
  // você pode expandir isso conforme necessário com outros campos
}

const MPPaymentButton: React.FC = () => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    const createPreference = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/create-mp-preference`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [
              {
                title: "Pedido do Cardápio",
                quantity: 1,
                unit_price: 25.0,
              },
            ],
          }),
        });

        const data: PreferenceResponse = await response.json();
        setPreferenceId(data.id);
      } catch (error) {
        console.error("Erro ao criar preferência de pagamento:", error);
      }
    };

    createPreference();
  }, []);

  return (
    <div>
      <h2>Pagamento</h2>
      {preferenceId && <Wallet initialization={{ preferenceId }} />}
    </div>
  );
};

export default MPPaymentButton;
