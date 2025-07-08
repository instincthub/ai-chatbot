"use client";

import React, { useState, FormEvent } from "react";
import { InputText, PasswordField, SubmitButton } from "@instincthub/react-ui";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { API_HOST_URL, openToast } from "@instincthub/react-ui/lib";

// Type definitions
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Login component using NextAuth.js authentication
 * Handles user authentication with email and password
 */
const LoginComponent: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [submitStatus, setSubmitStatus] = useState<number | undefined>(
    undefined
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    // if (session) {
    //   router.push("/main/dashboard");
    // }
  }, [session, router]);

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

  /**
   * Validates form data before submission
   * @param data The form data to validate
   * @returns Boolean indicating if form is valid
   */
  const validateForm = (data: LoginFormData): boolean => {
    if (!data.email.trim()) {
      setErrorMessage("Email is required");
      setSubmitStatus(400);
      return false;
    }

    if (!data.password.trim()) {
      setErrorMessage("Password is required");
      setSubmitStatus(400);
      return false;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      setErrorMessage("Please enter a valid email address");
      setSubmitStatus(400);
      return false;
    }

    return true;
  };

  /**
   * Handles form submission using NextAuth.js
   * @param e Form event object
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    };

    const url = `${API_HOST_URL}authuser/login/`;

    interface LoginResponse {
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      access_token: string;
      refresh_token?: string;
    }

    try {
      const response = await fetch(url, options);
      const data: LoginResponse = await response.json();

      if (data?.username && data?.access_token) {
        // Successful login

        // openToast(`Welcome back, ${data.username}!`, 200);


        // Trigger NextAuth sign-in with custom credentials
        const result = await signIn("credentials", {
          email: JSON.stringify(data),
          redirect: false,
        });

        if (result?.ok) {
          openToast(`Welcome back, ${data.username}!`, 200);
          router.push("/dashboard");
        } else {
          openToast("Authentication failed", 400);
        }
      } else {
        // Handle errors

        openToast("Invalid credentials", 400);
      }
    } catch (error) {
      console.error("Login error:", error);
      openToast("Network error. Please try again.", 500);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ihub-login-container">
      <div className="ihub-login-card">
        <div className="ihub-login-header">
          <h1>Login</h1>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <div className="ihub-login-form">
          <div className="ihub-form-fields">
            <InputText
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
            <PasswordField
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div className="ihub-login-error">{errorMessage}</div>
          )}

          <div>
            <SubmitButton
              label="Sign In"
              status={submitStatus}
              disabled={isLoading}
            />
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
    </form>
  );
};

export default LoginComponent;
