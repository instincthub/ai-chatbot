// src/components/Chat/ChatArea/SuggestedPrompts.tsx
import React from 'react';
import { FaImage, FaClipboard, FaPencilAlt, FaChartLine, FaRegLightbulb, FaQuestion, FaMagic } from 'react-icons/fa';

interface SuggestedPrompt {
  id: string;
  text: string;
  icon: React.ReactNode;
}

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onPromptClick }) => {
  const prompts: SuggestedPrompt[] = [
    { id: 'image', text: 'Create image', icon: <FaImage /> },
    { id: 'plan', text: 'Make a plan', icon: <FaClipboard /> },
    { id: 'text', text: 'Summarize text', icon: <FaPencilAlt /> },
    { id: 'data', text: 'Analyze data', icon: <FaChartLine /> },
    { id: 'advice', text: 'Get advice', icon: <FaQuestion /> },
    { id: 'surprise', text: 'Surprise me', icon: <FaMagic /> },
    { id: 'brainstorm', text: 'Brainstorm', icon: <FaRegLightbulb /> },
  ];

  return (
    <div className="suggested-prompts">
      <div className="prompt-grid">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            className="prompt-button"
            onClick={() => onPromptClick(prompt.text)}
          >
            <span className="prompt-icon">{prompt.icon}</span>
            <span className="prompt-text">{prompt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;