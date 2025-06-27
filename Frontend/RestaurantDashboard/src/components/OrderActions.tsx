import React from "react";

interface OrderActionsProps {
  onAdvance: () => void;
  onRegress: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({ onAdvance, onRegress }) => {
  return (
    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4 px-4">
      <button
        onClick={onAdvance}
        className="cursor-pointer bg-blue-200 hover:bg-blue-300 text-blue-900 px-8 py-4 rounded"
      >
        ⬆️ Avançar Pedido
      </button>
      <button
        onClick={onRegress}
        className="cursor-pointer bg-red-200 hover:bg-red-300 text-red-900 px-6 py-2 rounded"
      >
        ⬇️ Voltar Pedido
      </button>
    </div>
  );
};

export default OrderActions;
