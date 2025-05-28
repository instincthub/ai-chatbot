import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import ChatArea from "./chat-area/ChatArea";
import { ChatMessage, Project, ChatSession, User } from "../../types";

interface ChatLayoutProps {
  currentUser: User;
  availableModels: string[];
  currentModel: string;
  chatSessions: ChatSession[];
  projects: Project[];
  currentChatId: string | null;
  messages: ChatMessage[];
  onNewChat: () => void;
  onModelChange: (model: string) => void;
  onUserSwitch: (userId: string) => void;
  onSendMessage: (message: string) => void;
  onChatSelect: (chatId: string) => void;
  onProjectSelect: (projectId: string) => void;
  onSearch: (query: string) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  currentUser,
  availableModels,
  currentModel,
  chatSessions,
  projects,
  currentChatId,
  messages,
  onNewChat,
  onModelChange,
  onUserSwitch,
  onSendMessage,
  onChatSelect,
  onProjectSelect,
  onSearch,
}) => {
  return (
    <div className="chat-layout">
      <Sidebar
        chatSessions={chatSessions}
        projects={projects}
        currentChatId={currentChatId}
        onNewChat={onNewChat}
        onChatSelect={onChatSelect}
        onProjectSelect={onProjectSelect}
        onSearch={onSearch}
      />
      <div className="chat-main">
        <Header
          currentUser={currentUser}
          availableModels={availableModels}
          currentModel={currentModel}
          onModelChange={onModelChange}
          onUserSwitch={onUserSwitch}
        />
        <ChatArea
          messages={messages}
          onSendMessage={onSendMessage}
          currentModel={currentModel}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
