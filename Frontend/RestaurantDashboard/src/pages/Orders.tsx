import { useEffect, useState } from "react";
import Select from "react-select";
import {Order} from "../components/Order";
import OrderCard from "../components/Order";

const statusOptions = [
    { value: "In Progress", label: "Em Andamento" },
    { value: "On the Way to the customer", label: "A caminho do cliente" },
    { value: "Ready to take away", label: "Pronto para retirada" },
    { value: "Delivered/Picked up", label: "Entregue/Coletado" },
];

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState<{ value: string; label: string }[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [loading, setLoading] = useState(true);

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
        <div className="p-6">
            {/* Filtros */}
            <div className="filters flex flex-wrap gap-6 items-start mb-6">
                {/* MULTISELECT */}
                <div className="w-64">
                    <label className="block font-semibold mb-2">Filtrar Por Status</label>
                    <Select
                        isMulti
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(selected) => setStatusFilter(selected as { value: string; label: string }[])}
                        placeholder="Selecione o status..."
                        className="text-sm"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-2">Ordernar Por Horário</label>
                    <select
                        value={sortOrder}
                        onChange={(e) =>
                            setSortOrder(e.target.value as "asc" | "desc")
                        }
                        className="rounded-md border border-gray-300 px-3 py-2"
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
        </div>
    );
};

async function fetchOrders(): Promise<Order[]> {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    console.log("API URL:", apiUrl);
    const res = await fetch(`${apiUrl}/retrieve-orders`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })
    if (!res.ok) {
        throw new Error("Failed to fetch orders");
    }
    return res.json()
}

export default Orders;
