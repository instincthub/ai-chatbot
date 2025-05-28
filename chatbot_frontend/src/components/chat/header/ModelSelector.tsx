// src/components/Chat/Header/ModelSelector.tsx
import React from "react";
import { FaChevronDown } from "react-icons/fa";

interface ModelSelectorProps {
  availableModels: string[];
  currentModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  availableModels,
  currentModel,
  onModelChange,
}) => {
  return (
    <div className="model-selector">
      <select
        value={currentModel}
        onChange={(e) => onModelChange(e.target.value)}
        aria-label="Select AI model"
      >
        {availableModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <FaChevronDown className="dropdown-icon" />
    </div>
  );
};

export default ModelSelector;
