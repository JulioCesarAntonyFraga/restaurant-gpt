import { useState } from "react";
import { apiFetch } from "../utils/apiHelper";
import OrderItemList from "./OrderItemList";
import OrderInfo from "./OrderInfo";
import OrderActions from "./OrderActions";
import { useAuth } from "../utils/authContext";

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
  const { token } = useAuth();

  async function advanceOrderStatus(orderId: string) {
    try {
      const updatedOrder = await apiFetch(`/advance-order-status/${orderId}`, token ?? "",{
        method: "PUT",
      });
      const data = await updatedOrder.json();
      setOrder(data as Order);
    } catch (error: unknown) {
      console.error("Erro ao avançar pedido:", error);
      if (error instanceof Error) {
        alert(error.message || "Erro ao avançar pedido");
      } else {
        alert("Erro ao avançar pedido");
      }
    }
  }

  async function regressOrderStatus(orderId: string) {
    try {
      const updatedOrder = await apiFetch(`/regress-order-status/${orderId}`, token ?? "",{
        method: "PUT",
      });
      const data = await updatedOrder.json();
      setOrder(data as Order);
    } catch (error: unknown) {
      console.error("Erro ao avançar pedido:", error);
      if (error instanceof Error) {
        alert(error.message || "Erro ao avançar pedido");
      } else {
        alert("Erro ao avançar pedido");
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
      key={order.id}
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
