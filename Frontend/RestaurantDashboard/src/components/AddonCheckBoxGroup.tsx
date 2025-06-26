import React from "react";

export type Addon = {
  id: string;
  name: string;
  preco?: number;
};

type Props = {
  title: string;
  addons: Addon[];
  selectedAddons: { [key: string]: number };
  setSelectedAddons: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  showPriceField?: boolean;
};

const AddonCheckboxGroup: React.FC<Props> = ({
  title,
  addons,
  selectedAddons,
  setSelectedAddons,
  showPriceField = false,
}) => {
  return (
    <div className="mb-4 border p-4 rounded bg-gray-50">
      <h3 className="font-semibold mb-2">{title}</h3>
      {addons.map((item) => (
        <div key={item.id} className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={item.id in selectedAddons}
            className="cursor-pointer"
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedAddons((prev) => {
                const newState = { ...prev };
                if (checked) {
                  newState[item.id] = 0;
                } else {
                  delete newState[item.id];
                }
                return newState;
              });
            }}
          />
          <span>{item.name}</span>
          {showPriceField && (
            <input
              type="number"
              placeholder="Preço (R$)"
              className="w-24 p-1 border rounded"
              value={selectedAddons[item.id] ?? ""}
              onChange={(e) =>
                setSelectedAddons((prev) => ({
                  ...prev,
                  [item.id]: parseFloat(e.target.value),
                }))
              }
              disabled={!Object.prototype.hasOwnProperty.call(selectedAddons, item.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default AddonCheckboxGroup;
