import React from "react";

type Props = {
  title: string;
  addons: string[];
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
        <div key={item} className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={item in selectedAddons}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedAddons((prev) => {
                const newState = { ...prev };
                if (checked) {
                  newState[item] = 0;
                } else {
                  delete newState[item];
                }
                return newState;
              });
            }}
          />
          <span>{item}</span>
          {showPriceField && (
            <input
              type="number"
              placeholder="Preço (R$)"
              className="w-24 p-1 border rounded"
              value={selectedAddons[item] ?? ""}
              onChange={(e) =>
                setSelectedAddons((prev) => ({
                  ...prev,
                  [item]: parseFloat(e.target.value),
                }))
              }
              disabled={!Object.prototype.hasOwnProperty.call(selectedAddons, item)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default AddonCheckboxGroup;
