// src/components/Chat/ChatArea/ChatArea.tsx
import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestedPrompts from "./SuggestedPrompts";
import { ChatMessage } from "../../../types";

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentModel: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  currentModel,
}) => {
  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="chat-area">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <h1>What can I help with?</h1>
          <SuggestedPrompts onPromptClick={handlePromptClick} />
        </div>
      ) : (
        <ChatMessages messages={messages} />
      )}
      <ChatInput onSendMessage={onSendMessage} modelName={currentModel} />
    </div>
  );
};

export default ChatArea;
