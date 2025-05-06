import { useState } from "react";
import { formatTimestamp } from "../utils/orderUtils";

export interface Order {
    id: string;
    number: number;
    items: { name: string; amount: number; observation: string; }[];
    phone: string;
    is_delivery: boolean;
    ordered_at: number;
    status: string;
}

export interface OrderProps {
  order: Order
}

const OrderCard = (props : OrderProps) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [order, setOrder] = useState<Order>(props.order);

  async function advanceOrderStatus(orderId: string) {
    console.log("order", order);
    const res = await fetch(`${apiUrl}/advance-order-status/${orderId}`, {
      method: "PUT",
      headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },});
    if (!res.ok) {
        throw new Error("Failed to advance order status");
    }
    setOrder(await res.json())
  }
  
  async function regressOrderStatus(orderId: string) {
    console.log("order", order);
    const res = await fetch(`${apiUrl}/regress-order-status/${orderId}`, {
      method: "PUT",
      headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
      }, });
    if (!res.ok) {
        throw new Error("Failed to advance order status");
    }
    setOrder(await res.json())
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
      className={`rounded-xl p-4 shadow-md border border-yellow-300 ${statusColors[order.status as keyof typeof statusColors] || ''} font-hand text-lg`}
      style={{
        fontFamily: '"Patrick Hand", cursive',
      }}
    >
        <h2 className="text-xl font-bold mb-2">Order #{order.number}</h2>
        <div className="mb-2">
          <strong>Items:</strong>
          <ul className="list-disc list-inside">
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.amount}x {item.name}
                <p>{item.observation}</p>
              </li>
            ))}
          </ul>
        </div>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Type:</strong> {order.is_delivery ? "Delivery" : "Take Away"}</p>
        <p><strong>Time:</strong> {formatTimestamp(order.ordered_at)}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => advanceOrderStatus(order.id)} className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-4 py-1 rounded">
            ⬆️ Avançar Pedido
          </button>
          <button onClick={() => regressOrderStatus(order.id)} className="bg-red-200 hover:bg-red-300 text-red-900 px-4 py-1 rounded">
            ⬇️ Voltar Pedido
          </button>
        </div>
    </div>
  )
}

export default OrderCard