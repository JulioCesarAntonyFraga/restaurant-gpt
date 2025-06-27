import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@headlessui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiHelper";
import { useAuth } from "../utils/authContext";
import Footer from "../components/Footer";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
  max_toppings?: number;
  max_additionals?: number;
};

type AvailabilityFilter = "all" | "available" | "unavailable";
type SortField = "name" | "price" | "category";

const MenuList = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  async function fetchMenuItems(): Promise<MenuItem[]> {
    const res = await apiFetch(`/retrieve-menu-items`, token ?? "", {
      method: "GET",
    });
    if (!res.ok) {
      const errorData = await res.text();
      console.error("Erro ao buscar itens do menu:", errorData);

      return [];
    }
    return res.json();
  }

  useEffect(() => {
    const getItems = async () => {
        const data = await fetchMenuItems();
        setMenuItems(data);
        setLoading(false);
    };
    getItems();
  }, [token]);

  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [sortBy, setSortBy] = useState<SortField>("name");

  const navigate = useNavigate();

  if (loading) {
    return <p className="text-center mt-8">Carregando pedidos...</p>;
  }

  const toggleAvailability = (id: string) => {
    const item = menuItems.find((item) => item.id === id);
    if (item) {
      item.available = !item.available;

      apiFetch(`/edit-menu-item`, token ?? "", {
        method: "PUT",
        body: JSON.stringify(item),
      }).then((res) => {
        if (!res.ok) {
          alert("Erro ao atualizar a disponibilidade do item");
        } else {
          setMenuItems((prev) =>
            prev.map((prevItem) =>
              prevItem.id === id ? { ...prevItem, available: item.available } : prevItem
            )
          );
        }
      });
    }
  };

  const removeMenuItem = async (id: string) => {
    const res = await apiFetch(`/delete-menu-item/${id}`, token ?? "", {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("Erro ao remover item do menu:", await res.text());
    }
    else {
      setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const filteredItems = menuItems
    .filter((item) => {
      if (availabilityFilter === "available") return item.available;
      if (availabilityFilter === "unavailable") return !item.available;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });

  return (
    <div className="p-6 pb-20">
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-2xl font-bold">Itens do Cardápio</h1>
        <button
        className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-12 py-3 rounded"
          onClick={() => navigate("/menu/novo")}
          
        >
          + Adicionar Item
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Disponibilidade:</label>
          <select
            value={availabilityFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setAvailabilityFilter(e.target.value as AvailabilityFilter)
            }
            className="cursor-pointer ml-2 p-2 border rounded"
          >
            <option value="all">Todos</option>
            <option value="available">Disponíveis</option>
            <option value="unavailable">Indisponíveis</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value as SortField)
            }
            className="cursor-pointer ml-2 p-2 border rounded"
          >
            <option value="name">Nome</option>
            <option value="price">Preço</option>
            <option value="category">Categoria</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-gray-700 text-sm mb-1">
                  Categoria: <span className="font-medium">{item.category}</span>
                </p>
                <p className="text-gray-700 text-sm mb-1">
                  Preço: <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                </p>
                {item.description && (
                  <p className="text-gray-700 text-sm mb-1">
                    Descrição: {item.description}
                  </p>
                )}

                {typeof item.max_toppings === "number" && (
                  <p className="text-gray-700 text-sm mb-1">
                    Máximo de complementos: {item.max_toppings}
                  </p>
                )}

                {typeof item.max_additionals === "number" && (
                  <p className="text-gray-700 text-sm mb-1">
                    Máximo de adicionais: {item.max_additionals}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-700">Disponível:</span>
                  <Switch
                    checked={item.available}
                    onChange={() => toggleAvailability(item.id)}
                    className={`${
                      item.available ? "cursor-pointer bg-green-500" : "bg-gray-300"
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span
                      className={`${
                        item.available ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  className="cursor-pointer flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  onClick={() => navigate(`/menu/editar/${item.id}`)}
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  className="cursor-pointer flex items-center gap-1 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => removeMenuItem(item.id)}
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default MenuList;
