"use client";

import React, { useState, FormEvent } from "react";
import { InputText, PasswordField, SubmitButton } from "@instincthub/react-ui";

// Type definitions
interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Login component using InstinctHub React UI components
 * Handles user authentication with username and password
 */
const SignupComponent: React.FC = ({}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [submitStatus, setSubmitStatus] = useState<number | undefined>(
    undefined
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  /**
   * Handles form input changes
   * @param field The field name being updated
   * @param value The new value for the field
   */
  const handleInputChange = (
    field: keyof LoginFormData,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
      setSubmitStatus(undefined);
    }
  };

  const handleLoginSuccess = (data: LoginResponse) => {
    console.log("Login successful:", data);
    // Handle successful login (store token, update user state, etc.)
  };

  const handleLoginError = (error: string) => {
    console.error("Login error:", error);
    // Handle login errors (show toast, etc.)
  };

  /**
   * Validates form data before submission
   * @param data The form data to validate
   * @returns Boolean indicating if form is valid
   */
  const validateForm = (data: LoginFormData): boolean => {
    if (!data.username.trim()) {
      setErrorMessage("Username is required");
      setSubmitStatus(400);
      return false;
    }

    if (!data.password.trim()) {
      setErrorMessage("Password is required");
      setSubmitStatus(400);
      return false;
    }

    if (data.username.length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      setSubmitStatus(400);
      return false;
    }

    return true;
  };

  /**
   * Handles form submission
   * @param e Form event object
   */
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm(formData)) {
      handleLoginError(errorMessage);
      return;
    }

    setSubmitStatus(0); // Loading state
    setErrorMessage("");

    try {
      // Simulate API call - replace with actual authentication logic
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result: LoginResponse = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus(1); // Success
        handleLoginSuccess?.(result);

        // Redirect if URL provided
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      } else {
        const errorMsg = result.message || "Login failed. Please try again.";
        setErrorMessage(errorMsg);
        setSubmitStatus(400);
        handleLoginError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = "Network error. Please check your connection.";
      setErrorMessage(errorMsg);
      setSubmitStatus(500);
      handleLoginError?.(errorMsg);
    }
  };

  return (
    <div className="ihub-login-container">
      <div className="ihub-login-card">
        <div className="ihub-login-header">
          <h1>Signup</h1>
          <p>Input correct details to signup.</p>
        </div>

        {/* 
      export interface User {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  phone_number: string;
}
      
      */}

        <div className="ihub-login-form">
          <div className="ihub-form-fields">
            <InputText id="email" name="email" label="Email" required />
            <InputText
              id="first_name"
              name="text"
              label="First Name"
              required
            />
            <InputText id="last_name" name="text" label="Last Name" required />
            <InputText
              id="username"
              name="username"
              label="Username"
              required
            />

            <PasswordField
              id="password"
              name="password"
              label="Password"
              required
            />
            <PasswordField
              id="password2"
              name="password2"
              label="Retype Password"
              required
            />
          </div>

          {errorMessage && (
            <div className="ihub-login-error">{errorMessage}</div>
          )}

          <div onClick={handleSubmit}>
            <SubmitButton label="Sign In" status={submitStatus} />
          </div>
        </div>

        <div className="ihub-login-footer">
          <p>
            Don't have an account?{" "}
            <a href="/auth/signup" className="ihub-link">
              Sign up here
            </a>
          </p>
          <p>
            <a href="/auth/forgot-password" className="ihub-link">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupComponent;
