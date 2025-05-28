// src/components/Chat/Sidebar/ChatHistoryList.tsx
import React from "react";
import { FaComment } from "react-icons/fa";
import { ChatSession } from "../../../types";

interface ChatHistoryListProps {
  chatSessions: ChatSession[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({
  chatSessions,
  currentChatId,
  onChatSelect,
}) => {
  if (chatSessions.length === 0) {
    return <div className="empty-list">No chat history</div>;
  }

  return (
    <ul className="chat-history-list">
      {chatSessions.map((session) => (
        <li
          key={session.id}
          className={`chat-history-item ${
            session.id === currentChatId ? "active" : ""
          }`}
          onClick={() => onChatSelect(session.id)}
        >
          <FaComment className="chat-icon" />
          <div className="chat-info">
            <span className="chat-title">{session.title}</span>
            <span className="chat-date">
              {new Date(session.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ChatHistoryList;
