// src/components/Chat/Sidebar/Sidebar.tsx
import React from "react";
import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import NavigationLinks from "./NavigationLinks";
import ChatHistoryList from "./ChatHistoryList";
import { ChatSession, Project } from "../../../types";
import ProjectsList from "./ProjectList";

interface SidebarProps {
  chatSessions: ChatSession[];
  projects: Project[];
  currentChatId: string | null;
  onNewChat: () => void;
  onChatSelect: (chatId: string) => void;
  onProjectSelect: (projectId: string) => void;
  onSearch: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chatSessions,
  projects,
  currentChatId,
  onNewChat,
  onChatSelect,
  onProjectSelect,
  onSearch,
}) => {
  return (
    <div className="sidebar">
      <SidebarHeader onNewChat={onNewChat} />
      <SearchBar onSearch={onSearch} />
      <NavigationLinks />
      <div className="sidebar-section">
        <h3>Projects</h3>
        <ProjectsList projects={projects} onProjectSelect={onProjectSelect} />
      </div>
      <div className="sidebar-section">
        <h3>Recent Chats</h3>
        <ChatHistoryList
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onChatSelect={onChatSelect}
        />
      </div>
    </div>
  );
};

export default Sidebar;
