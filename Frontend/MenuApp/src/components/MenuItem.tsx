import { useCart } from "../utils/CartContext";

type MenuItemProps = {
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
};

const MenuItem = ({ name, price, category, description, image }: MenuItemProps) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <img src={image} alt={name} className="w-full h-40 object-cover rounded mb-4" />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="mt-2 font-medium text-blue-600">R$ {price.toFixed(2)}</p>
      <button
        onClick={() => addToCart({ name, price, category, description, image })}
        className="mt-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
      >
        Adicionar ao Carrinho
      </button>
    </div>
  );
};

export default MenuItem;
