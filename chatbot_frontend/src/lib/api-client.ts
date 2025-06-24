const DJANGO_API_URL =
  process.env.DJANGO_API_URL || "http://localhost:8000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone_number?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  message: string;
}

export class ApiClient {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${DJANGO_API_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || "Request failed",
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request error:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  static async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    return this.makeRequest<RegisterResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ access: string }>> {
    return this.makeRequest<{ access: string }>("/auth/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  static async logout(accessToken: string): Promise<ApiResponse> {
    return this.makeRequest("/auth/logout/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  static async getProfile(accessToken: string): Promise<ApiResponse> {
    return this.makeRequest("/auth/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
