import { useState } from "react";
import { apiFetch } from "../utils/apiHelper";
import OrderItemList from "./OrderItemList";
import OrderInfo from "./OrderInfo";
import OrderActions from "./OrderActions";
import { useAuth } from "../utils/authContext";

export interface Order {
  id: string;
  order_number: number;
  name: string;
  items: { name: string; quantity: number; observation: string }[];
  phone_number: string;
  is_delivery: boolean;
  ordered_at: number;
  status: number;
  cep: string;
  rua: string;
  numero: string;
  cidade: string;
  bairro: string;
}

export interface OrderProps {
  order: Order;
}

const OrderCard = ({ order: initialOrder }: OrderProps) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const { token } = useAuth();

  async function advanceOrderStatus(orderId: string) {
    try {
      const updatedOrder = await apiFetch(
        `/advance-order-status/${orderId}`,
        token ?? "",
        {
          method: "PUT",
        }
      );
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
      const updatedOrder = await apiFetch(
        `/regress-order-status/${orderId}`,
        token ?? "",
        {
          method: "PUT",
        }
      );
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
    2: "bg-yellow-100",
    3: "bg-blue-100",
    4: "bg-green-100",
    5: "bg-gray-300",
  };

  return (
    <div
      key={order.id}
      className={`rounded-xl p-4 shadow-md border border-yellow-300 ${statusColors[order.status as keyof typeof statusColors] || ""
        } font-hand text-lg`}
      style={{ fontFamily: '"Patrick Hand", cursive' }}
    >
      <h2 className="text-xl font-bold mb-2">Order #{order.order_number}</h2>

      <OrderItemList items={order.items} />
      <OrderInfo
        name={order.name}
        phone={order.phone_number}
        is_delivery={order.is_delivery}
        ordered_at={order.ordered_at}
        status={order.status}
        cep={order.cep}
        rua={order.rua}
        numero={order.numero}
        bairro={order.bairro}
        cidade={order.cidade}
      />

      <OrderActions
        onAdvance={() => advanceOrderStatus(order.id)}
        onRegress={() => regressOrderStatus(order.id)}
      />
    </div>
  );
};

export default OrderCard;
