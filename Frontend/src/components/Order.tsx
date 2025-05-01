import { formatTimestamp } from "../utils/orderUtils";

export interface Order {
    id: number;
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

const OrderCard = ({order} : OrderProps) => {
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
              backgroundColor: "#fff8dc",
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
              <button onClick={() => console.log("Avançar pedido")} className="bg-blue-200 hover:bg-blue-300 text-blue-900 px-4 py-1 rounded">
                ⬆️ Avançar Pedido
              </button>
              <button onClick={() => console.log("Voltar pedido")} className="bg-red-200 hover:bg-red-300 text-red-900 px-4 py-1 rounded">
                ⬇️ Voltar Pedido
              </button>
            </div>
          </div>
  )
}

export default OrderCard