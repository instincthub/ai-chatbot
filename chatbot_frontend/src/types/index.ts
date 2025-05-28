// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  lastUpdated: number;
  modelId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}
