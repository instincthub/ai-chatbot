// src/components/Chat/Sidebar/SidebarHeader.tsx
import React from "react";
import { FaPlus } from "react-icons/fa";

interface SidebarHeaderProps {
  onNewChat: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onNewChat }) => {
  return (
    <div className="sidebar-header">
      <div className="logo">
        <img src="/logo.svg" alt="Chat Logo" />
      </div>
      <button
        className="new-chat-button"
        onClick={onNewChat}
        aria-label="Start new chat"
      >
        <FaPlus /> New Chat
      </button>
    </div>
  );
};

export default SidebarHeader;
