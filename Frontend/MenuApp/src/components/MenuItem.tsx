import { useState } from "react";
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
  const [showObservation, setShowObservation] = useState(false);
  const [observation, setObservation] = useState("");

  const handleAddToCart = () => {
    addToCart({ name, price, observation }); // passa a observação para o carrinho
    setShowObservation(false);
    setObservation("");
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <img
        src={
          image
            ? image
            : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
        }
        alt={name}
        className="w-full h-40 object-cover rounded mb-4"
      />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="mt-2 font-medium text-blue-600">R$ {price.toFixed(2)}</p>

      {!showObservation ? (
        <button
          onClick={() => setShowObservation(true)}
          className="mt-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
        >
          Adicionar
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Digite uma observação (opcional)"
            rows={3}
          />
          <div className="flex gap-2">
            <button
  onClick={() => {
    setShowObservation(false);
    setObservation("");
  }}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
>
  Cancelar
</button>
<button
  onClick={handleAddToCart}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
>
  Adicionar ao carrinho
</button>

          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
