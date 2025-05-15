// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  description: string;
  file: string;
  content_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  processed: boolean;
  processing_error: string;
}

// Chat Types
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

// Widget Types
export interface WidgetConfiguration {
  id: string;
  name: string;
  primary_color: string;
  title: string;
  welcome_message: string;
  allowed_domains: string;
  enable_file_upload: boolean;
  enable_feedback: boolean;
  created_at: string;
  updated_at: string;
  conversation_count: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}
