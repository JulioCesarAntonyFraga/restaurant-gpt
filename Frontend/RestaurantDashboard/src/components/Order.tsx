import { useState } from "react";
import { apiFetch } from "../utils/apiHelper";
import OrderItemList from "./OrderItemList";
import OrderInfo from "./OrderInfo";
import OrderActions from "./OrderActions";
import { useAuth } from "../utils/authContext"; // deve ser o mesmo nome exato do arquivo


export interface Order {
  id: string;
  number: number;
  items: { name: string; amount: number; observation: string }[];
  phone: string;
  is_delivery: boolean;
  ordered_at: number;
  status: string;
}

export interface OrderProps {
  order: Order;
}

const OrderCard = ({ order: initialOrder }: OrderProps) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const { token } = useAuth(); // Pegando o token do contexto

  async function advanceOrderStatus(orderId: string) {
    try {
      const updatedOrder = await apiFetch(`/advance-order-status/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrder(updatedOrder as Order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro ao avançar pedido:", error.message);
        alert(error.message || "Erro ao avançar pedido");
      }
    }
  }

  async function regressOrderStatus(orderId: string) {
    try {
      const updatedOrder = await apiFetch(`/regress-order-status/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrder(updatedOrder as Order);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro ao regredir pedido:", error.message);
        alert(error.message || "Erro ao regredir pedido");
      } else {
        console.error("Erro desconhecido:", error);
      }
    }
  }

  const statusColors = {
    "In Progress": "bg-yellow-100",
    "On the Way to the customer": "bg-blue-100",
    "Ready to take away": "bg-green-100",
    "Delivered/Picked up": "bg-gray-300",
  };

  return (
    <div
      className={`rounded-xl p-4 shadow-md border border-yellow-300 ${
        statusColors[order.status as keyof typeof statusColors] || ""
      } font-hand text-lg`}
      style={{ fontFamily: '"Patrick Hand", cursive' }}
    >
      <h2 className="text-xl font-bold mb-2">Order #{order.number}</h2>

      <OrderItemList items={order.items} />

      <OrderInfo
        phone={order.phone}
        isDelivery={order.is_delivery}
        orderedAt={order.ordered_at}
        status={order.status}
      />

      <OrderActions
        onAdvance={() => advanceOrderStatus(order.id)}
        onRegress={() => regressOrderStatus(order.id)}
      />
    </div>
  );
};

export default OrderCard;
