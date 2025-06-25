import { formatTimestamp } from "../utils/orderUtils";

export interface OrderInfoProps {
  name?: string;
  phone: string;
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
  phone,
  is_delivery,
  ordered_at,
  status,
  cep,
  rua,
  numero,
  bairro,
  cidade,
}: OrderInfoProps) => {
   console.log("📦 Dados recebidos em <OrderInfo />:", {
    name,
    phone,
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

  const statusLabel =
    statusOptions.find((opt) => opt.value === status)?.label || "Desconhecido";

  return (
    <div className="text-sm text-gray-800 mt-2">
      {name && <p><strong>Nome:</strong> {name}</p>}
      <p><strong>Telefone:</strong> {phone}</p>
      <p><strong>Tipo:</strong> {is_delivery ? "Delivery" : "Take Away"}</p>
      <p><strong>Horário:</strong> {formatTimestamp(ordered_at)}</p>
      <p><strong>Situação:</strong> {statusLabel}</p>

      {is_delivery && (
        <div className="mt-2">
          {cep && <p><strong>CEP:</strong> {cep}</p>}
          {(rua || numero) && (
            <p>
              <strong>Endereço:</strong> {rua ?? "?"}, {numero ?? "?"}
            </p>
          )}
          {bairro && <p><strong>Bairro:</strong> {bairro}</p>}
          {cidade && <p><strong>Cidade:</strong> {cidade}</p>}
        </div>
      )}
    </div>
  );
};

export default OrderInfo;
