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
