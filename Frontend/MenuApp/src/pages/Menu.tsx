import { useEffect, useState } from "react";
import MenuItem, { Additionals, Toppings } from "../components/MenuItem";
import Footer from "../components/Footer";

type MenuItemType = {
  id: string;
  name: string;
  phone_number: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  toppings: Toppings[];
  max_toppings: number;
  additionals: Additionals[];
  max_additionals: number;
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
    return <p className="text-center mt-24 font-bold text-gray-800">Carregando cardápio...</p>;
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
    <div className="flex flex-col min-h-screen">
      
      {/* Banner entre a Navbar e o Cardápio */}
      <div
  className="pt-20 bg-cover bg-center bg-no-repeat w-full shadow-inner"
  style={{ backgroundImage: "url('/images/bunner.jpg')" }} 
>
  <div className="bg-transparent bg-opacity-60 w-full h-full">
    <div className="max-w-6xl mx-auto px-4 py-6 text-center text-white">
      <h2 className="text-3xl font-bold mb-2">Restaurante Sabor Caseiro</h2>
      <p className="text-sm sm:text-base">📍 Rua das Flores, 123 – Centro, Cidade Exemplo</p>
      <p className="text-sm sm:text-base">☎️ (11) 91234-5678</p>
    </div>
  </div>
</div>

      {/* Conteúdo do Cardápio */}
      <div className="flex-grow max-w-6xl mx-auto px-4 py-6">
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
              max_toppings={item.max_toppings}
              toppings={item.toppings}
              additionals={item.additionals}
              max_additionals={item.max_additionals}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Menu;
