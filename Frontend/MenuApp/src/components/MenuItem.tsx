import { useState } from "react";
import { useCart } from "../utils/CartContext";

export type MenuItemProps = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
};

const MenuItem = ({ id, name, price, description, imageUrl }: MenuItemProps) => {
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [observation, setObservation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = [
    "Extra queijo",
    "Sem cebola",
    "Molho especial",
    "Pão integral",
    "Tamanho grande",
    "Pimenta",
  ];

  const handleCheckboxChange = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      name,    
      price,
      observation: `${observation}${selectedOptions.length ? ` | Opções: ${selectedOptions.join(", ")}` : ""
        }`,
    });
    setShowModal(false);
    setObservation("");
    setSelectedOptions([]);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col relative">
      <img
        src={
          imageUrl
            ? imageUrl
            : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
        }
        alt={name}
        className="w-full h-40 object-cover rounded mb-4"
      />
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="mt-2 font-medium text-blue-600">R$ {price.toFixed(2)}</p>

      <button
        onClick={() => setShowModal(true)}
        className="mt-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
      >
        Adicionar
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md md:max-w-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4">Opções</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-4">
              {options.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="Digite uma observação (opcional)"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setObservation("");
                  setSelectedOptions([]);
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
        </div>
      )}
    </div>
  );
};

export default MenuItem;
