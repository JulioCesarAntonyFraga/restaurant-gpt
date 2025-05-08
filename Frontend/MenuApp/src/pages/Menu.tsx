import { useEffect, useState } from "react";
import MenuItem from "../components/MenuItem";

type MenuItemType = {
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
};

const mockMenu: MenuItemType[] = [
  {
    name: "Pizza Margherita",
    price: 35.5,
    category: "Pizza",
    description: "Molho de tomate, muçarela e manjericão fresco.",
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
  },
  {
    name: "Lasanha Bolonhesa",
    price: 42,
    category: "Massas",
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
  },
  {
    name: "Spaghetti Carbonara",
    price: 37,
    category: "Massas",
    description: "Clássico italiano com bacon e ovo.",
    image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
  },
];

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");

  useEffect(() => {
    setMenuItems(mockMenu);
  }, []);

  const categories = ["Todos", ...Array.from(new Set(mockMenu.map(item => item.category)))];

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
            key={index}
            name={item.name}
            price={item.price}
            category={item.category}
            description={item.description}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default Menu;
