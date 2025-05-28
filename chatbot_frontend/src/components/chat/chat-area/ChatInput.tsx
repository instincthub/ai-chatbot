// src/components/Chat/ChatArea/ChatInput.tsx
import React, { useState } from "react";
import { FaPaperPlane, FaMicrophone, FaUpload } from "react-icons/fa";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  modelName: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, modelName }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-container">
      <form className="chat-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${modelName}...`}
            rows={1}
            aria-label="Type your message"
          />
          <div className="input-buttons">
            <button
              type="button"
              className="input-button"
              aria-label="Upload file"
            >
              <FaUpload />
            </button>
            <button
              type="button"
              className="input-button"
              aria-label="Voice input"
            >
              <FaMicrophone />
            </button>
            <button
              type="submit"
              className={`send-button ${!message.trim() ? "disabled" : ""}`}
              disabled={!message.trim()}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </form>
      <div className="input-footer">
        <p className="disclaimer">
          ChatGPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
