// src/components/Chat/ChatArea/ChatMessages.tsx
import React, { useEffect, useRef } from "react";
import { ChatMessage } from "../../../types";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${
            message.role === "user" ? "user-message" : "assistant-message"
          }`}
        >
          <div className="message-avatar">
            {message.role === "user" ? (
              <div className="user-avatar">U</div>
            ) : (
              <div className="assistant-avatar">AI</div>
            )}
          </div>
          <div className="message-content">
            <p>{message.content}</p>
            {message.role === "assistant" && (
              <div className="message-actions">
                <button className="action-button">Copy</button>
                <button className="action-button">Thumbs up</button>
                <button className="action-button">Thumbs down</button>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
