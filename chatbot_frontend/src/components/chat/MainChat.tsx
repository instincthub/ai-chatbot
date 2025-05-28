"use client";
import React, { useState } from "react";
import ChatLayout from "./ChatLayout";
import { User, ChatMessage, Project, ChatSession } from "../../types";
import "../../assets/css/main-chat.css";

// Mock data
const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
};

const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Learning AI",
    description: "AI learning projects",
    createdAt: Date.now(),
  },
];

const mockChatSessions: ChatSession[] = [
  {
    id: "c1",
    title: "AI Voice Query",
    lastUpdated: Date.now() - 3600000,
    modelId: "gpt-4o",
  },
  {
    id: "c2",
    title: "What is this?",
    lastUpdated: Date.now() - 86400000,
    modelId: "gpt-4o",
  },
  {
    id: "c3",
    title: "AI trends 2023",
    lastUpdated: Date.now() - 172800000,
    modelId: "gpt-4o",
  },
  {
    id: "c4",
    title: "Web Footer Code Example",
    lastUpdated: Date.now() - 259200000,
    modelId: "gpt-4o",
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: "m1",
      role: "user",
      content: "How can I use voice recognition with AI?",
      timestamp: Date.now() - 3700000,
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Voice recognition with AI involves using speech-to-text models...",
      timestamp: Date.now() - 3600000,
    },
  ],
};

const availableModels = ["ChatGPT 4o", "ChatGPT 4", "ChatGPT 3.5"];

const MainChat: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(mockUser);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [chatSessions, setChatSessions] =
    useState<ChatSession[]>(mockChatSessions);
  const [currentChatId, setCurrentChatId] = useState<string | null>("c1");
  const [currentModel, setCurrentModel] = useState<string>(availableModels[0]);
  const [messages, setMessages] =
    useState<Record<string, ChatMessage[]>>(mockMessages);

  const handleSendMessage = (message: string) => {
    if (!currentChatId) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    const updatedMessages = {
      ...messages,
      [currentChatId]: [...(messages[currentChatId] || []), newMessage],
    };

    setMessages(updatedMessages);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content: `This is a mock response to: "${message}"`,
        timestamp: Date.now() + 1,
      };

      setMessages({
        ...updatedMessages,
        [currentChatId]: [...updatedMessages[currentChatId], aiResponse],
      });
    }, 1000);
  };

  const handleNewChat = () => {
    const newChatId = `c${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: "New Chat",
      lastUpdated: Date.now(),
      modelId: currentModel,
    };

    setChatSessions([newChat, ...chatSessions]);
    setCurrentChatId(newChatId);
    setMessages({
      ...messages,
      [newChatId]: [],
    });
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
  };

  const handleUserSwitch = (userId: string) => {
    // In a real app, this would fetch the new user's data
    console.log(`Switching to user ${userId}`);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleProjectSelect = (projectId: string) => {
    console.log(`Selected project ${projectId}`);
    // In a real app, this would load the project's chats
  };

  const handleSearch = (query: string) => {
    console.log(`Searching for ${query}`);
    // In a real app, this would filter the chat sessions
  };

  return (
    <div className="app">
      <ChatLayout
        currentUser={currentUser}
        availableModels={availableModels}
        currentModel={currentModel}
        chatSessions={chatSessions}
        projects={projects}
        currentChatId={currentChatId}
        messages={currentChatId ? messages[currentChatId] || [] : []}
        onNewChat={handleNewChat}
        onModelChange={handleModelChange}
        onUserSwitch={handleUserSwitch}
        onSendMessage={handleSendMessage}
        onChatSelect={handleChatSelect}
        onProjectSelect={handleProjectSelect}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default MainChat;
