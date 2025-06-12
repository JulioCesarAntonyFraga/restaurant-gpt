import { useEffect, useState } from "react";
import MenuItem, { Additional, Topping } from "../components/MenuItem";

type MenuItemType = {
  id: string;
  name: string;
  phone_number: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  maxComplementos: number;
  complementos: Topping[];
  adicionais: Additional[];
};

async function fetchMenuItems(): Promise<MenuItemType[]> {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${apiUrl}/retrieve-menu-items`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getItems = async () => {
      try {
        const data = await fetchMenuItems();
        setMenuItems(data);
      } catch (error) {
        console.error("Erro ao buscar itens do menu:", error);
      } finally {
        setLoading(false);
      }
    };
    getItems();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Carregando cardápio...</p>;
  }

  const categories = ["Todos", ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = menuItems
    .filter(item => selectedCategory === "Todos" || item.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Cardápio</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Categoria:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded bg-white"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "price")}
            className="p-2 border rounded bg-white"
          >
            <option value="name">Nome</option>
            <option value="price">Preço</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <MenuItem
            id={item.id}
            key={index}
            name={item.name}
            phone_number={item.phone_number}
            price={item.price}
            category={item.category}
            description={item.description}
            imageUrl={item.imageUrl}
            maxComplementos={item.maxComplementos}
            toppings={item.complementos}
            additionals={item.adicionais}
          />
        ))}
      </div>
    </div>
  );
};

export default Menu;
