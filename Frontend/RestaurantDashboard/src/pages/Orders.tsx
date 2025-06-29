import { useEffect, useState } from "react";
import Select from "react-select";
import OrderCard, {Order} from "../components/OrderCard";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import Footer from "../components/Footer";

const statusOptions = [
    { value: 0, label: "Pendente" },
    { value: 1, label: "Aceito" },
    { value: 2, label: "Em andamento" },
    { value: 3, label: "Pronto para coleta/entrega" },
    { value: 4, label: "A caminho do cliente" },
    { value: 5, label: "Coletado/Entregue" },
];

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState<{ value: number; label: string }[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);

    async function fetchOrders(): Promise<Order[]> {
        const res = await apiFetch(`/retrieve-orders`, token ?? "",{
            method: "GET",
        })
        if (!res.ok) {
            throw new Error("Failed to fetch orders");
        }
        return res.json()
    }

    useEffect(() => {
        const getOrders = async () => {
            try {
                const data = await fetchOrders()
                setOrders(data);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            } finally {
                setLoading(false);
            }
        }
        getOrders();
    }, []);

    if (loading) {
        return <p className="text-center mt-8">Carregando pedidos...</p>
    }

    const filteredOrders = orders
        .filter((order) =>
        statusFilter.length === 0
            ? true
            : statusFilter.some((status) => status.value === order.status)
        )
        .sort((a, b) => {
    const dateA = new Date(a.ordered_at).getTime();
    const dateB = new Date(b.ordered_at).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
});


    return (
  <div className="min-h-screen flex flex-col pb-10">
    <main className="flex-grow p-6">
      {/* Filtros */}
      <div className="filters flex flex-wrap gap-6 items-start mb-6">
        <div className="w-64">
          <label className="block font-semibold mb-2">Filtrar Por Status</label>
          <Select
            isMulti
            options={statusOptions}
            value={statusFilter}            
            onChange={(selected) =>
              setStatusFilter(selected as { value: number; label: string }[])
            }
            placeholder="Selecione o status..."
            className="text-sm"
  styles={{
    control: (base) => ({
      ...base,
      cursor: "pointer", 
    }),
    option: (base) => ({
      ...base,
      cursor: "pointer", 
    }),
    multiValueRemove: (base) => ({
      ...base,
      cursor: "pointer", 
    }),
  }}
/>
        </div>

        <div>
          <label className="block font-semibold mb-2">Ordernar Por Horário</label>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "asc" | "desc")
            }
            className=" rounded-md border border-gray-300 px-3 py-2 cursor-pointer"
          >
            <option value="desc">Mais Recente</option>
            <option value="asc">Mais Antigo</option>
          </select>
        </div>
      </div>

      {/* Grid de Pedidos */}
      <div className="orders-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </main>

    {/* Rodapé */}
    <Footer />
  </div>
);
};

export default Orders;
