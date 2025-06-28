import React, { useState } from "react";

interface OrderActionsProps {
  onAdvance: () => Promise<void>;
  onRegress: () => Promise<void>;
}

const OrderActions: React.FC<OrderActionsProps> = ({ onAdvance, onRegress }) => {
  const [loadingAction, setLoadingAction] = useState<null | "advance" | "regress">(null);

  const handleAdvance = async () => {
    setLoadingAction("advance");
    await onAdvance();
    setLoadingAction(null);
  };

  const handleRegress = async () => {
    setLoadingAction("regress");
    await onRegress();
    setLoadingAction(null);
  };

  return (
    <>
      {/* Tela de carregamento */}
      {loadingAction && (
        <div className="fixed inset-0 bg-transparent bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold mb-4">
              {loadingAction === "advance" ? "Avançando pedido..." : "Voltando pedido..."}
            </p>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4 px-4">
        <button
          onClick={handleAdvance}
          disabled={loadingAction !== null}
          className="cursor-pointer bg-blue-200 hover:bg-blue-300 text-blue-900 px-8 py-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬆️ Avançar Pedido
        </button>
        <button
          onClick={handleRegress}
          disabled={loadingAction !== null}
          className="cursor-pointer bg-red-200 hover:bg-red-300 text-red-900 px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬇️ Voltar Pedido
        </button>
      </div>
    </>
  );
};

export default OrderActions;
