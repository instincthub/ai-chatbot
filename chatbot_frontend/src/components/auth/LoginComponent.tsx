"use client";

import React, { useState, FormEvent } from "react";
import { InputText, PasswordField, SubmitButton } from "@instincthub/react-ui";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setSubmitStatus(0); // Loading state
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password");
        setSubmitStatus(400);
      } else {
        setSubmitStatus(1); // Success
        // NextAuth will handle the session automatically
        router.push("/main/dashboard");
      }
    } catch (error) {
      const errorMsg = "Network error. Please check your connection.";
      setErrorMessage(errorMsg);
      setSubmitStatus(500);
    } finally {
      setIsLoading(false);
    }
  };

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
