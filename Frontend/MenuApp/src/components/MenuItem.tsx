import { useCart } from "../utils/CartContext";

export type MenuItemProps = {
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
};

const MenuItem = ({ name, price, description, image }: MenuItemProps) => {
  const { addToCart } = useCart();
  
  const add = async () => {
    addToCart({ name, price });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <img src={image ? image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} alt={name} className="w-full h-40 object-cover rounded mb-4" />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="mt-2 font-medium text-blue-600">R$ {price.toFixed(2)}</p>
      <button
        onClick={() => add()}
        className="mt-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
      >
        Adicionar ao Carrinho
      </button>
    </div>
  );
};

export default MenuItem;
