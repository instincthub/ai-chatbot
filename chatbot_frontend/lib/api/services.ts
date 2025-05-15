import apiClient from "./client";
import { Document, Conversation, Message, WidgetConfiguration } from "@/types";
import { ApiResponse } from "@/types";

// Documents API
export const documentsApi = {
  getAll: () => apiClient.get<ApiResponse<Document[]>>("/documents/"),
  get: (id: string) =>
    apiClient.get<ApiResponse<Document>>(`/documents/${id}/`),
  create: (data: FormData) =>
    apiClient.post<ApiResponse<Document>>("/documents/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  update: (id: string, data: Partial<Document>) =>
    apiClient.patch<ApiResponse<Document>>(`/documents/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}/`),
};

// Conversations API
export const conversationsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Conversation[]>>("/chat/conversations/"),
  get: (id: string) =>
    apiClient.get<ApiResponse<Conversation>>(`/chat/conversations/${id}/`),
  create: (data: Partial<Conversation>) =>
    apiClient.post<ApiResponse<Conversation>>("/chat/conversations/", data),
  update: (id: string, data: Partial<Conversation>) =>
    apiClient.patch<ApiResponse<Conversation>>(
      `/chat/conversations/${id}/`,
      data
    ),
  delete: (id: string) => apiClient.delete(`/chat/conversations/${id}/`),
};

// Messages API
export const messagesApi = {
  getAll: (conversationId: string) =>
    apiClient.get<ApiResponse<Message[]>>(
      `/chat/conversations/${conversationId}/messages/`
    ),
  create: (conversationId: string, data: Partial<Message>) =>
    apiClient.post<ApiResponse<Message>>(
      `/chat/conversations/${conversationId}/messages/`,
      data
    ),
};

// Widget API
export const widgetApi = {
  getAll: () => apiClient.get<ApiResponse<WidgetConfiguration[]>>("/widgets/"),
  get: (id: string) =>
    apiClient.get<ApiResponse<WidgetConfiguration>>(`/widgets/${id}/`),
  create: (data: Partial<WidgetConfiguration>) =>
    apiClient.post<ApiResponse<WidgetConfiguration>>("/widgets/", data),
  update: (id: string, data: Partial<WidgetConfiguration>) =>
    apiClient.patch<ApiResponse<WidgetConfiguration>>(`/widgets/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/widgets/${id}/`),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ access: string; refresh: string }>>(
      "/auth/login/",
      { email, password }
    ),
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) =>
    apiClient.post<ApiResponse<{ user: any; access: string; refresh: string }>>(
      "/auth/register/",
      userData
    ),
  getUser: () => apiClient.get<ApiResponse<any>>("/auth/user/"),
  refreshToken: (refresh: string) =>
    apiClient.post<ApiResponse<{ access: string }>>("/auth/token/refresh/", {
      refresh,
    }),
};
