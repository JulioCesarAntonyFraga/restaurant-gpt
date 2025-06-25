import { formatTimestamp } from "../utils/orderUtils";

export interface OrderInfoProps {
  name?: string;
  phone_number: string;
  is_delivery: boolean;
  ordered_at: number;
  status: number;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
}

const OrderInfo = ({
  name,
  phone_number,
  is_delivery,
  ordered_at,
  status,
  cep,
  rua,
  numero,
  bairro,
  cidade,
}: OrderInfoProps) => {
  // Log dos dados recebidos
  console.log("📦 Dados recebidos no OrderInfo:", {
    name,
    phone_number,
    is_delivery,
    ordered_at,
    status,
    cep,
    rua,
    numero,
    bairro,
    cidade,
  });

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
      <p><strong>Telefone:</strong> {phone_number}</p>
      <p><strong>Tipo:</strong> {is_delivery ? "Delivery" : "Take Away"}</p>
      <p><strong>Horário:</strong> {formatTimestamp(ordered_at)}</p>
      <p><strong>Situação:</strong> {statusOptions.find(opt => opt.value === status)?.label || "Desconhecido"}</p>

      {is_delivery && (
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
