import React from "react";

interface OrderActionsProps {
  onAdvance: () => void;
  onRegress: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ onAdvance, onRegress }) => {
  return (
    <div className="mt-4 flex gap-2">
      <button
        onClick={onAdvance}
        className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-4 py-1 rounded"
      >
        ⬆️ Avançar Pedido
      </button>
      <button
        onClick={onRegress}
        className="bg-red-200 hover:bg-red-300 text-red-900 px-4 py-1 rounded"
      >
        ⬇️ Voltar Pedido
      </button>
    </div>
  );
};

export default OrderActions;
