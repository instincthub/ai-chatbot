// src/components/chat/header/Header.tsx
import React from "react";
import { User } from "../../../types";
import ModelSelector from "./ModelSelector";
import UserProfile from "./UserProfile";

interface HeaderProps {
  currentUser: User;
  availableModels: string[];
  currentModel: string;
  onModelChange: (model: string) => void;
  onUserSwitch: (userId: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  availableModels,
  currentModel,
  onModelChange,
  onUserSwitch,
}) => {
  return (
    <header className="chat-header">
      <ModelSelector
        availableModels={availableModels}
        currentModel={currentModel}
        onModelChange={onModelChange}
      />
      <UserProfile currentUser={currentUser} onUserSwitch={onUserSwitch} />
    </header>
  );
};

export default Header;
