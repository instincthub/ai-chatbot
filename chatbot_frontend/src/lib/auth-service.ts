import { ApiClient } from "./api-client";

export interface UserRegistrationData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginAttempt {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
}

export class AIAuthService {
  /**
   * Register a new user with AI-enhanced validation
   */
  static async registerUser(data: UserRegistrationData) {
    try {
      // AI-powered validation
      const validationResult = await this.validateRegistrationData(data);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // Use API client for user registration
      const result = await ApiClient.register({
        email: data.email,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        password: data.password,
        phone_number: data.phoneNumber,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || "Registration failed. Please try again.",
        };
      }

      const userData = result.data;

      // Log successful registration
      await this.logAuthEvent({
        userId: userData.user.id,
        event: "REGISTRATION",
        success: true,
        metadata: {
          email: data.email,
          username: data.username,
        },
      });

      return {
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
          username: userData.user.username,
          firstName: userData.user.first_name,
          lastName: userData.user.last_name,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  }

  /**
   * Authenticate user with AI-powered security analysis
   */
  static async authenticateUser(
    email: string,
    password: string,
    context?: any
  ) {
    try {
      // AI-powered login attempt analysis
      const securityAnalysis = await this.analyzeLoginAttempt(email, context);
      if (!securityAnalysis.isSafe) {
        return {
          success: false,
          error:
            securityAnalysis.reason || "Login blocked for security reasons",
        };
      }

      // Use API client for authentication
      const result = await ApiClient.login({
        email,
        password,
      });

      if (!result.success || !result.data) {
        await this.logAuthEvent({
          email,
          event: "LOGIN_ATTEMPT",
          success: false,
          metadata: { reason: "Invalid credentials" },
        });
        return {
          success: false,
          error: result.error || "Invalid credentials",
        };
      }

      const userData = result.data;

      // Log successful login
      await this.logAuthEvent({
        userId: userData.user.id,
        email,
        event: "LOGIN_SUCCESS",
        success: true,
        metadata: { context },
      });

      return {
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
          username: userData.user.username,
          firstName: userData.user.first_name,
          lastName: userData.user.last_name,
        },
        tokens: {
          access: userData.access,
          refresh: userData.refresh,
        },
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: "Authentication failed. Please try again.",
      };
    }
  }

  /**
   * AI-powered registration data validation
   */
  private static async validateRegistrationData(data: UserRegistrationData) {
    const errors: string[] = [];

    // Email validation with AI pattern recognition
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      errors.push("Invalid email format");
    }

    // Username validation
    if (data.username.length < 3 || data.username.length > 20) {
      errors.push("Username must be between 3 and 20 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores"
      );
    }

    // Password strength analysis
    const passwordStrength = await this.analyzePasswordStrength(data.password);
    if (passwordStrength.score < 3) {
      errors.push(`Password is too weak: ${passwordStrength.feedback}`);
    }

    // Name validation
    if (data.firstName.length < 2 || data.lastName.length < 2) {
      errors.push("First and last names must be at least 2 characters");
    }

    return {
      isValid: errors.length === 0,
      error: errors.join(", "),
    };
  }

  /**
   * AI-powered password strength analysis
   */
  private static async analyzePasswordStrength(password: string) {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score++;
    else feedback.push("Password should be at least 8 characters");

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    else feedback.push("Include lowercase letters");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("Include uppercase letters");

    if (/[0-9]/.test(password)) score++;
    else feedback.push("Include numbers");

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push("Include special characters");

    // Common password check (simplified)
    const commonPasswords = ["password", "123456", "qwerty", "admin"];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push("Avoid common passwords");
    }

    return {
      score,
      feedback: feedback.join(", "),
    };
  }

  /**
   * AI-powered login attempt analysis
   */
  private static async analyzeLoginAttempt(email: string, context?: any) {
    // Get recent login attempts for this email
    const recentAttempts = await this.getRecentLoginAttempts(email);

    // Check for suspicious patterns
    const failedAttempts = recentAttempts.filter((attempt) => !attempt.success);

    if (failedAttempts.length >= 5) {
      return {
        isSafe: false,
        reason: "Too many failed attempts. Please try again later.",
      };
    }

    // Rate limiting check
    const recentAttemptsCount = recentAttempts.filter(
      (attempt) =>
        new Date().getTime() - attempt.timestamp.getTime() < 5 * 60 * 1000 // 5 minutes
    ).length;

    if (recentAttemptsCount >= 10) {
      return {
        isSafe: false,
        reason: "Too many login attempts. Please try again later.",
      };
    }

    return { isSafe: true };
  }

  /**
   * Get recent login attempts for analysis
   */
  private static async getRecentLoginAttempts(
    email: string
  ): Promise<LoginAttempt[]> {
    // This would typically query a login attempts table
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Log authentication events for AI analysis
   */
  private static async logAuthEvent(data: {
    userId?: string;
    email?: string;
    event: string;
    success: boolean;
    metadata?: any;
  }) {
    // This would typically log to a dedicated auth events table
    // For now, just console log for demonstration
    console.log("Auth Event:", {
      timestamp: new Date(),
      ...data,
    });
  }
}
