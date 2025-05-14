# Next.js Project Scaffolding

This phase focuses on setting up a Next.js frontend for a customer support chatbot system. The project is structured to create a modern, scalable web application with TypeScript integration.

## Key Components

1. **Project Structure**

- Frontend application using Next.js with TypeScript
- Organized directory structure for components, layouts, and API integration
- Clear separation of concerns between auth, main, and widget sections

2. **Technical Setup**

- TypeScript configuration with proper path aliases
- API client setup for backend communication
- Comprehensive type definitions for data models
- Integration with @instincthub/react-ui for UI components

3. **Core Features**

- Authentication system (login/register)
- Dashboard for monitoring system metrics
- Chat interface for conversations
- Widget system for embedding chat on external websites

4. **Architecture**

- Route groups for different sections (auth, main, widget)
- Reusable layouts for consistent UI
- API services for backend communication
- Widget embed script for third-party integration

**Purpose**
This phase establishes the foundation for a customer support chatbot that can:

- Process and respond to user queries
- Manage documents and conversations
- Provide embeddable chat widgets
- Handle user authentication and management

The setup follows modern web development practices and is designed to be maintainable and scalable.

### 1 Initialize Next.js Project

1. Navigate to the frontend directory:

   ```bash
   cd ../chatbot_frontend
   ```

2. Initialize Next.js project:

   ```bash
   npx create-next-app@latest . --typescript --app --eslint
   ```

3. Install required dependencies:

   ```bash
   npm install @instincthub/react-ui jwt-decode
   ```

4. Create project structure:
   ```bash
   mkdir -p app/api
   mkdir -p app/(auth)
   mkdir -p app/(main)
   mkdir -p app/(widget)
   mkdir -p components/ui
   mkdir -p components/chat
   mkdir -p components/documents
   mkdir -p components/widget
   mkdir -p lib/api
   mkdir -p lib/auth
   mkdir -p lib/utils
   ```

### 2. Configure TypeScript

1. Update tsconfig.json with proper paths:

   ```json
   {
     "compilerOptions": {
       "target": "es5",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "preserve",
       "incremental": true,
       "plugins": [
         {
           "name": "next"
         }
       ],
       "paths": {
         "@/*": ["./*"],
         "@/components/*": ["./components/*"],
         "@/lib/*": ["./lib/*"],
         "@/types/*": ["./types/*"]
       }
     },
     "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
     "exclude": ["node_modules"]
   }
   ```

2. Create types directory and define types:

   ```bash
   mkdir -p types
   touch types/index.ts
   ```

3. Add base types in types/index.ts:

   ```typescript
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
   ```

### 3. Create API Client

1. Create API client in lib/api/client.ts:

   ```typescript
   // Base API URL
   const API_BASE_URL =
     process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

   // Helper function to get auth token
   const getAuthToken = (): string | null => {
     if (typeof window !== "undefined") {
       return localStorage.getItem("accessToken");
     }
     return null;
   };

   // API client with fetch
   const apiClient = {
     async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
       const url = `${API_BASE_URL}${endpoint}`;

       // Default headers
       const headers = new Headers({
         "Content-Type": "application/json",
         ...options.headers,
       });

       // Add auth token if available
       const token = getAuthToken();
       if (token) {
         headers.append("Authorization", `Bearer ${token}`);
       }

       // Merge options
       const config: RequestInit = {
         ...options,
         headers,
       };

       try {
         const response = await fetch(url, config);

         // Handle unauthorized errors (401)
         if (response.status === 401) {
           // Token refresh logic would go here
           // For now, just throw an error
           throw new Error("Unauthorized");
         }

         // Handle other error responses
         if (!response.ok) {
           throw new Error(`API error: ${response.status}`);
         }

         // Parse JSON response
         const data = await response.json();
         return data as T;
       } catch (error) {
         console.error("API request failed:", error);
         throw error;
       }
     },

     // Convenience methods
     get<T>(endpoint: string, options?: RequestInit) {
       return this.request<T>(endpoint, { ...options, method: "GET" });
     },

     post<T>(endpoint: string, body: any, options?: RequestInit) {
       return this.request<T>(endpoint, {
         ...options,
         method: "POST",
         body: JSON.stringify(body),
       });
     },

     patch<T>(endpoint: string, body: any, options?: RequestInit) {
       return this.request<T>(endpoint, {
         ...options,
         method: "PATCH",
         body: JSON.stringify(body),
       });
     },

     delete<T>(endpoint: string, options?: RequestInit) {
       return this.request<T>(endpoint, { ...options, method: "DELETE" });
     },
   };

   export default apiClient;
   ```

2. Create API services in lib/api/services.ts:

   ```typescript
   import apiClient from "./client";
   import {
     Document,
     Conversation,
     Message,
     WidgetConfiguration,
   } from "@/types";
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
     getAll: () =>
       apiClient.get<ApiResponse<WidgetConfiguration[]>>("/widgets/"),
     get: (id: string) =>
       apiClient.get<ApiResponse<WidgetConfiguration>>(`/widgets/${id}/`),
     create: (data: Partial<WidgetConfiguration>) =>
       apiClient.post<ApiResponse<WidgetConfiguration>>("/widgets/", data),
     update: (id: string, data: Partial<WidgetConfiguration>) =>
       apiClient.patch<ApiResponse<WidgetConfiguration>>(
         `/widgets/${id}/`,
         data
       ),
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
       apiClient.post<
         ApiResponse<{ user: any; access: string; refresh: string }>
       >("/auth/register/", userData),
     getUser: () => apiClient.get<ApiResponse<any>>("/auth/user/"),
     refreshToken: (refresh: string) =>
       apiClient.post<ApiResponse<{ access: string }>>("/auth/token/refresh/", {
         refresh,
       }),
   };
   ```

### 4. Create Base Layout

1. Create the root layout in app/layout.tsx:

   ```tsx
   import "@/styles/globals.css";
   import type { Metadata } from "next";

   export const metadata: Metadata = {
     title: "Customer Support Chatbot",
     description: "AI-powered customer support chatbot with RAG",
   };

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body>{children}</body>
       </html>
     );
   }
   ```

2. Create the auth layout in app/(auth)/layout.tsx:

   ```tsx
   export default function AuthLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <div className="ihub-flex ihub-min-h-screen ihub-flex-col ihub-items-center ihub-justify-center ihub-bg-gray-50">
         <div className="ihub-w-full ihub-max-w-md ihub-p-8 ihub-bg-white ihub-rounded-lg ihub-shadow-lg">
           {children}
         </div>
       </div>
     );
   }
   ```

3. Create the main layout in app/(main)/layout.tsx:

   ```tsx
   export default function MainLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <div className="ihub-flex ihub-min-h-screen ihub-flex-col">
         <header className="ihub-bg-blue-600 ihub-text-white ihub-p-4">
           <div className="ihub-container ihub-mx-auto ihub-flex ihub-justify-between ihub-items-center">
             <h1 className="ihub-text-xl ihub-font-bold">
               Support Chatbot Admin
             </h1>
             <nav>{/* Nav items will go here */}</nav>
           </div>
         </header>
         <main className="ihub-flex-1 ihub-container ihub-mx-auto ihub-p-4">
           {children}
         </main>
         <footer className="ihub-bg-gray-100 ihub-p-4 ihub-text-center ihub-text-gray-500">
           <div className="ihub-container ihub-mx-auto">
             &copy; {new Date().getFullYear()} Support Chatbot
           </div>
         </footer>
       </div>
     );
   }
   ```

4. Create the widget layout in app/(widget)/layout.tsx:
   ```tsx
   export default function WidgetLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <div className="ihub-flex ihub-flex-col ihub-min-h-screen ihub-max-h-screen ihub-overflow-hidden">
         {children}
       </div>
     );
   }
   ```

### 5. Create Basic Pages

1. Create the homepage in app/page.tsx:

   ```tsx
   import Link from "next/link";

   export default function Home() {
     return (
       <div className="ihub-flex ihub-min-h-screen ihub-flex-col ihub-items-center ihub-justify-center ihub-bg-gray-50">
         <div className="ihub-text-center ihub-max-w-2xl ihub-p-8">
           <h1 className="ihub-text-4xl ihub-font-bold ihub-mb-4">
             Customer Support Chatbot
           </h1>
           <p className="ihub-text-xl ihub-mb-8">
             AI-powered support chatbot that leverages your company documents to
             provide accurate responses.
           </p>
           <div className="ihub-flex ihub-gap-4 ihub-justify-center">
             <Link
               href="/login"
               className="ihub-bg-blue-600 ihub-text-white ihub-px-6 ihub-py-3 ihub-rounded-lg ihub-font-medium ihub-shadow-md ihub-hover:bg-blue-700"
             >
               Login
             </Link>
             <Link
               href="/chat"
               className="ihub-bg-gray-200 ihub-text-gray-800 ihub-px-6 ihub-py-3 ihub-rounded-lg ihub-font-medium ihub-shadow-md ihub-hover:bg-gray-300"
             >
               Try Demo
             </Link>
           </div>
         </div>
       </div>
     );
   }
   ```

2. Create login page in app/(auth)/login/page.tsx:

   ```tsx
   "use client";

   import { useState } from "react";
   import { useRouter } from "next/navigation";
   import Link from "next/link";

   export default function Login() {
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [error, setError] = useState("");
     const [loading, setLoading] = useState(false);
     const router = useRouter();

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoading(true);
       setError("");

       try {
         // Auth logic will be implemented here
         // For now, just redirect to dashboard
         router.push("/dashboard");
       } catch (err: any) {
         setError(err.message || "Failed to login");
       } finally {
         setLoading(false);
       }
     };

     return (
       <>
         <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-6 ihub-text-center">
           Login
         </h1>

         {error && (
           <div className="ihub-bg-red-100 ihub-text-red-700 ihub-p-3 ihub-rounded ihub-mb-4">
             {error}
           </div>
         )}

         <form onSubmit={handleSubmit}>
           <div className="ihub-mb-4">
             <label
               className="ihub-block ihub-text-gray-700 ihub-mb-2"
               htmlFor="email"
             >
               Email
             </label>
             <input
               id="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="ihub-w-full ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
               required
             />
           </div>

           <div className="ihub-mb-6">
             <label
               className="ihub-block ihub-text-gray-700 ihub-mb-2"
               htmlFor="password"
             >
               Password
             </label>
             <input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="ihub-w-full ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
               required
             />
           </div>

           <button
             type="submit"
             disabled={loading}
             className="ihub-w-full ihub-bg-blue-600 ihub-text-white ihub-p-2 ihub-rounded ihub-font-medium ihub-hover:bg-blue-700 disabled:ihub-opacity-50"
           >
             {loading ? "Logging in..." : "Login"}
           </button>
         </form>

         <div className="ihub-mt-4 ihub-text-center ihub-text-sm">
           Don&apos;t have an account?{" "}
           <Link
             href="/register"
             className="ihub-text-blue-600 ihub-hover:underline"
           >
             Register
           </Link>
         </div>
       </>
     );
   }
   ```

3. Create a basic dashboard page in app/(main)/dashboard/page.tsx:

   ```tsx
   "use client";

   export default function Dashboard() {
     return (
       <div>
         <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-6">Dashboard</h1>

         <div className="ihub-grid ihub-grid-cols-1 md:ihub-grid-cols-3 ihub-gap-6">
           <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">
               Documents
             </h2>
             <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">
               0
             </p>
             <p className="ihub-mt-2 ihub-text-gray-500">
               Total documents in knowledge base
             </p>
           </div>

           <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">
               Conversations
             </h2>
             <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">
               0
             </p>
             <p className="ihub-mt-2 ihub-text-gray-500">
               Total chat conversations
             </p>
           </div>

           <div className="ihub-bg-white ihub-p-6 ihub-rounded-lg ihub-shadow-md">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-2">
               Widgets
             </h2>
             <p className="ihub-text-3xl ihub-font-bold ihub-text-blue-600">
               0
             </p>
             <p className="ihub-mt-2 ihub-text-gray-500">Active chat widgets</p>
           </div>
         </div>
       </div>
     );
   }
   ```

4. Create a basic chat page in app/(main)/chat/page.tsx:

   ```tsx
   "use client";

   export default function ChatPage() {
     return (
       <div className="ihub-flex ihub-flex-col ihub-h-[calc(100vh-9rem)]">
         <h1 className="ihub-text-2xl ihub-font-bold ihub-mb-4">Chat</h1>

         <div className="ihub-flex ihub-flex-row ihub-h-full ihub-gap-4">
           <div className="ihub-w-1/4 ihub-bg-white ihub-shadow-md ihub-rounded-lg ihub-p-4 ihub-overflow-y-auto">
             <h2 className="ihub-text-lg ihub-font-semibold ihub-mb-4">
               Conversations
             </h2>
             <div className="ihub-flex ihub-justify-between ihub-items-center ihub-mb-4">
               <input
                 type="text"
                 placeholder="Search conversations..."
                 className="ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded ihub-w-full"
               />
             </div>
             <p className="ihub-text-gray-500 ihub-text-center ihub-mt-6">
               No conversations yet
             </p>
           </div>

           <div className="ihub-flex-1 ihub-flex ihub-flex-col ihub-bg-white ihub-shadow-md ihub-rounded-lg ihub-overflow-hidden">
             <div className="ihub-p-4 ihub-border-b ihub-font-semibold">
               New Conversation
             </div>

             <div className="ihub-flex-1 ihub-p-4 ihub-overflow-y-auto">
               <div className="ihub-flex ihub-flex-col ihub-gap-4">
                 <p className="ihub-text-gray-500 ihub-text-center ihub-my-8">
                   Start a new conversation by typing a message below.
                 </p>
               </div>
             </div>

             <div className="ihub-border-t ihub-p-4">
               <div className="ihub-flex ihub-gap-2">
                 <input
                   type="text"
                   placeholder="Type your message..."
                   className="ihub-flex-1 ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
                 />
                 <button className="ihub-bg-blue-600 ihub-text-white ihub-px-4 ihub-py-2 ihub-rounded ihub-font-medium ihub-hover:ihub-bg-blue-700">
                   Send
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     );
   }
   ```

5. Create a basic widget preview page in app/(widget)/widget/[id]/page.tsx:

   ```tsx
   "use client";

   interface Params {
     params: {
       id: string;
     };
   }

   export default function WidgetPreview({ params }: Params) {
     const { id } = params;

     return (
       <div className="ihub-flex ihub-flex-col ihub-h-screen ihub-bg-white">
         <div className="ihub-p-3 ihub-bg-blue-600 ihub-text-white ihub-text-center">
           <h1 className="ihub-text-lg ihub-font-semibold">Support Chat</h1>
         </div>

         <div className="ihub-flex-1 ihub-p-4 ihub-overflow-y-auto">
           <div className="ihub-mb-4 ihub-bg-gray-100 ihub-rounded-lg ihub-p-3 ihub-max-w-xs">
             <p>Hello! How can I help you today?</p>
           </div>
         </div>

         <div className="ihub-p-3 ihub-border-t">
           <div className="ihub-flex ihub-gap-2">
             <input
               type="text"
               placeholder="Type your message..."
               className="ihub-flex-1 ihub-p-2 ihub-border ihub-border-gray-300 ihub-rounded"
             />
             <button className="ihub-bg-blue-600 ihub-text-white ihub-px-4 ihub-py-2 ihub-rounded ihub-font-medium ihub-hover:ihub-bg-blue-700">
               Send
             </button>
           </div>
         </div>
       </div>
     );
   }
   ```

### 6. Create Widget Embed Script
This is an embeddable chat widget that can be added to any website, similar to popular customer support widgets like Intercom or Drift.

Website owners would embed this widget by adding a simple script tag to their site, with the widget automatically handling its own initialization and display.

This provides a non-intrusive way for websites to offer instant customer support through an AI-powered chatbot interface.

1. Create a widget embed script in public/widget.js:

   ```bash
   mkdir -p public
   touch public/widget.js
   ```

2. Add the following content:

   ```javascript
   (function () {
     // Configuration
     const config = {
       widgetId: "WIDGET_ID", // Will be replaced when script is generated
       baseUrl: "WIDGET_BASE_URL", // Will be replaced when script is generated
     };

     // Create widget container
     function createWidget() {
       // Create widget container
       const container = document.createElement("div");
       container.id = "support-chatbot-widget-container";
       container.style.position = "fixed";
       container.style.bottom = "20px";
       container.style.right = "20px";
       container.style.zIndex = "9999";

       // Create widget iframe
       const iframe = document.createElement("iframe");
       iframe.id = "support-chatbot-widget-iframe";
       iframe.src = `${config.baseUrl}/widget/${config.widgetId}`;
       iframe.style.border = "none";
       iframe.style.width = "350px";
       iframe.style.height = "500px";
       iframe.style.borderRadius = "10px";
       iframe.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
       iframe.style.display = "none";

       // Create toggle button
       const button = document.createElement("button");
       button.id = "support-chatbot-widget-button";
       button.innerHTML = `
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
         </svg>
       `;
       button.style.width = "60px";
       button.style.height = "60px";
       button.style.borderRadius = "50%";
       button.style.backgroundColor = "#2563EB";
       button.style.color = "white";
       button.style.border = "none";
       button.style.cursor = "pointer";
       button.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
       button.style.display = "flex";
       button.style.alignItems = "center";
       button.style.justifyContent = "center";

       // Toggle widget visibility on button click
       button.addEventListener("click", function () {
         if (iframe.style.display === "none") {
           iframe.style.display = "block";
           button.innerHTML = `
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
             </svg>
           `;
         } else {
           iframe.style.display = "none";
           button.innerHTML = `
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
             </svg>
           `;
         }
       });

       // Append elements to container
       container.appendChild(iframe);
       container.appendChild(button);

       // Append container to body
       document.body.appendChild(container);
     }

     // Initialize widget
     function init() {
       if (document.readyState === "complete") {
         createWidget();
       } else {
         window.addEventListener("load", createWidget);
       }
     }

     // Start initialization
     init();
   })();
   ```
