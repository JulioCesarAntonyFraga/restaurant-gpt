import { formatTimestamp } from "../utils/orderUtils";

export interface OrderInfoProps {
    name?: string;
    phone: string;
    isDelivery: boolean;
    orderedAt: number;
    status: number;
    cep?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;

  }
  
  const OrderInfo = ({ name, phone, isDelivery, orderedAt, status, cep, rua, numero, bairro, cidade }: OrderInfoProps) => {
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
        <p><strong>Nome:</strong> {name}</p>
        <p><strong>Telefone:</strong> {phone}</p>
      <p><strong>Tipo:</strong> {isDelivery ? "Delivery" : "Take Away"}</p>
      <p><strong>Horário:</strong> {formatTimestamp(orderedAt)}</p>
      <p><strong>Situação:</strong> {statusOptions.find(opt => opt.value === status)?.label || "Desconhecido"}</p>

      {isDelivery && (
        <div className="mt-2 text-sm text-gray-700">
          <p><strong>CEP:</strong> {cep}</p>
          <p><strong>Endereço:</strong> {rua}, {numero}</p>
          <p><strong>Bairro:</strong> {bairro}</p>
          <p><strong>Cidade:</strong> {cidade}</p>
        </div>
      )}
    </div>
  );
};

  
  export default OrderInfo;
  