import { formatTimestamp } from "../utils/orderUtils";

export interface OrderInfoProps {
    phone: string;
    isDelivery: boolean;
    orderedAt: number;
    status: number;
  }
  
  const OrderInfo = ({ phone, isDelivery, orderedAt, status }: OrderInfoProps) => {
    const statusOptions = [
        { value: 0, label: "Pendente" },
        { value: 1, label: "Aceito" },
        { value: 2, label: "Em andamento" },
        { value: 3, label: "Pronto para coleta/entrega" },
        { value: 4, label: "A caminho do cliente" },
        { value: 5, label: "Coletado/Entregue" },
    ];

    return (
      <div>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Type:</strong> {isDelivery ? "Delivery" : "Take Away"}</p>
        <p><strong>Time:</strong> {formatTimestamp(orderedAt)}</p>
        <p><strong>Status:</strong> {statusOptions.find(opt => opt.value === status)?.label || "Desconhecido"}</p>
      </div>
    );
  };
  
  export default OrderInfo;
  