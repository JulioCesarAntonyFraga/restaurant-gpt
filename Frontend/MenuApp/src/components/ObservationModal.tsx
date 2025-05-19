// ObservationModal.tsx
import React, { useState } from "react";


type ObservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (observation: string) => void;
};

const ObservationModal: React.FC<ObservationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [observation, setObservation] = useState("");

  if (!isOpen) return null;

  return (
    <div className="modal">
      <textarea
        value={observation}
        onChange={(e) => setObservation(e.target.value)}
        placeholder="Digite alguma observação..."
      />
      <button onClick={() => onConfirm(observation)}>Confirmar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
};

export default ObservationModal;
