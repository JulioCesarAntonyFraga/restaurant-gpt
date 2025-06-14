import { useState, useEffect } from "react";
import { useCart } from "../utils/CartContext";

export type MenuItemProps = {
  id: string;
  name: string;
  phone_number: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  maxComplementos?: number;
  toppings: Topping[];
  additionals: Additional[];
};

export type Topping = {
  name: string;
  available: boolean;
  description?: string;
};

export type ComplementGroup = {
  name: string;
  max: number;
  toppings: Topping[];
};

export type Additional = {
  name: string;
  price: number;
  available: boolean;
  description?: string;
};

const MenuItem = ({
  id,
  name,
  price,
  description,
  imageUrl,
  maxComplementos,
  toppings,
  additionals,
}: MenuItemProps) => {
  const { addToCart } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [observation, setObservation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [complementGroups, setComplementGroups] = useState<ComplementGroup[]>([]);

  const handleCheckboxChange = (group: ComplementGroup, option: string) => {
    const selectedInGroup = group.toppings.filter(opt =>
      selectedOptions.includes(opt.name)
    ).length;

    const alreadySelected = selectedOptions.includes(option);
    const canSelectMore = selectedInGroup < group.max || alreadySelected;

    if (!canSelectMore) return;

    setSelectedOptions((prev) =>
      alreadySelected
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleAdditionalChange = (name: string) => {
    setSelectedAdditionals((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    const extras = [];

    if (selectedOptions.length) {
      extras.push(`Complementos: ${selectedOptions.join(", ")}`);
    }

    if (selectedAdditionals.length) {
      extras.push(`Adicionais: ${selectedAdditionals.join(", ")}`);
    }

    const fullObservation = [observation, ...extras].filter(Boolean).join(" | ");

    addToCart({
      id,
      name,
      price,
      observation: fullObservation,
    });

    setShowModal(false);
    setObservation("");
    setSelectedOptions([]);
    setSelectedAdditionals([]);
  };

  useEffect(() => {
    if (!showModal) return;
    setComplementGroups([
      {
        name: "Complementos",
        max: maxComplementos ?? 0,
        toppings: toppings,
      },
    ]);
  }, [showModal, maxComplementos]);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col relative">
      <img
        src={imageUrl || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            {complementGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                <h3 className="text-lg font-bold mb-1">{group.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Escolha até {group.max} complemento{group.max > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {group.toppings.map((option) => {
                    const isSelected = selectedOptions.includes(option.name);
                    const selectedInGroup = group.toppings.filter((opt) =>
                      selectedOptions.includes(opt.name)
                    ).length;
                    const canSelectMore = selectedInGroup < group.max || isSelected;

                    return (
                      <label
                        key={option.name}
                        className={`flex items-center gap-2 p-2 border rounded-md hover:bg-gray-100 text-sm 
                          ${!canSelectMore && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!canSelectMore && !isSelected}
                          onChange={() => handleCheckboxChange(group, option.name)}
                        />
                        <span>{option.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <h3 className="text-xl font-bold mb-4 text-gray-800">Adicionais</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {additionals.map((item) => (
                <label
                  key={item.name}
                  className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-100 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedAdditionals.includes(item.name)}
                    onChange={() => handleAdditionalChange(item.name)}
                  />
                  <span>
                    {item.name} (R$ {item.price.toFixed(2)})
                  </span>
                </label>
              ))}
            </div>

            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-6"
              placeholder="Digite uma observação (opcional)"
              rows={3}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setObservation("");
                  setSelectedOptions([]);
                  setSelectedAdditionals([]);
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
