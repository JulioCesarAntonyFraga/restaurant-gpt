import React, { useState } from "react";

type Option = {
  id: string;
  name: string;
};

type OptionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: string[], observation: string) => void;
  options: Option[];
};

const OptionsModal = ({ isOpen, onClose, onConfirm, options }: OptionsModalProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [observation, setObservation] = useState("");

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedOptions, observation);
    setSelectedOptions([]);
    setObservation("");
    onClose();
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md md:max-w-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Escolha os adicionais</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-4">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => toggleOption(option.id)}
              />
              {option.name}
            </label>
          ))}
        </div>

        <textarea
          placeholder="Observações (opcional)"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          rows={3}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectedOptions([]);
              setObservation("");
              onClose();
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsModal;
