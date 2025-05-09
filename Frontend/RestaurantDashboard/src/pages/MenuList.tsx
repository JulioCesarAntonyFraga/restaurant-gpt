import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@headlessui/react";
import React from "react";

type MenuItem = {
  name: string;
  price: number;
  available: boolean;
  category: string;
  description?: string;
};

const mockData: MenuItem[] = [
  {
    name: "Pizza Margherita",
    price: 35.5,
    available: true,
    category: "Pizza",
    description: "Molho de tomate, muçarela e manjericão fresco.",
  },
  {
    name: "Lasanha Bolonhesa",
    price: 42,
    available: false,
    category: "Massas",
  },
  {
    name: "Spaghetti Carbonara",
    price: 37,
    available: true,
    category: "Massas",
  },
];

type AvailabilityFilter = "all" | "available" | "unavailable";
type SortField = "name" | "price" | "category";

const MenuList = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [sortBy, setSortBy] = useState<SortField>("name");

  useEffect(() => {
    setMenuItems(mockData);
  }, []);

  const toggleAvailability = (index: number) => {
    setMenuItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, available: !item.available } : item
      )
    );
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Itens do Cardápio</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm font-medium">Disponibilidade:</label>
          <select
            value={availabilityFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setAvailabilityFilter(e.target.value as AvailabilityFilter)
            }
            className="ml-2 p-2 border rounded"
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
            className="ml-2 p-2 border rounded"
          >
            <option value="name">Nome</option>
            <option value="price">Preço</option>
            <option value="category">Categoria</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
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
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-700">Disponível:</span>
                  <Switch
                    checked={item.available}
                    onChange={() => toggleAvailability(idx)}
                    className={`${
                      item.available ? "bg-green-500" : "bg-gray-300"
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
                <button className="flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                  <Pencil size={16} />
                  Editar
                </button>
                <button className="flex items-center gap-1 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">
                  <Trash2 size={16} />
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuList;
