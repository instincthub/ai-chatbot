"use client";

import React, { useState, FormEvent } from "react";
import { InputText, PasswordField, SubmitButton } from "@instincthub/react-ui";
import { useRouter } from "next/navigation";
import { AIAuthService } from "@/lib/auth-service";

// Type definitions
interface SignupFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  password2: string;
  phoneNumber: string;
}

/**
 * Signup component using AI-enhanced authentication
 * Handles user registration with advanced validation
 */
const SignupComponent: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    password2: "",
    phoneNumber: "",
  });
  const [submitStatus, setSubmitStatus] = useState<number | undefined>(
    undefined
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  /**
   * Handles form input changes
   * @param field The field name being updated
   * @param value The new value for the field
   */
  const handleInputChange = (
    field: keyof SignupFormData,
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
  const validateForm = (data: SignupFormData): boolean => {
    if (!data.email.trim()) {
      setErrorMessage("Email is required");
      setSubmitStatus(400);
      return false;
    }

    if (!data.username.trim()) {
      setErrorMessage("Username is required");
      setSubmitStatus(400);
      return false;
    }

    if (!data.firstName.trim()) {
      setErrorMessage("First name is required");
      setSubmitStatus(400);
      return false;
    }

    if (!data.lastName.trim()) {
      setErrorMessage("Last name is required");
      setSubmitStatus(400);
      return false;
    }

    if (!data.password.trim()) {
      setErrorMessage("Password is required");
      setSubmitStatus(400);
      return false;
    }

    if (data.password !== data.password2) {
      setErrorMessage("Passwords do not match");
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

    // Username validation
    if (data.username.length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      setSubmitStatus(400);
      return false;
    }

    return true;
  };

  /**
   * Handles form submission using AI authentication service
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
      const result = await AIAuthService.registerUser({
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
      });

      if (result.success) {
        setSubmitStatus(1); // Success
        e.currentTarget.reset();

        // Redirect to login page after successful registration
        router.push(
          "/auth/login?message=Registration successful! Please sign in."
        );
      } else {
        setErrorMessage(
          result.error || "Registration failed. Please try again."
        );
        setSubmitStatus(400);
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
          <h1>Signup</h1>
          <p>Create your account with AI-enhanced security.</p>
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
            <InputText
              id="first_name"
              name="first_name"
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
            />
            <InputText
              id="last_name"
              name="last_name"
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
            />
            <InputText
              id="username"
              name="username"
              label="Username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />
            <InputText
              id="phone_number"
              name="phone_number"
              label="Phone Number (Optional)"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
            <PasswordField
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
            <PasswordField
              id="password2"
              name="password2"
              label="Confirm Password"
              value={formData.password2}
              onChange={(e) => handleInputChange("password2", e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div className="ihub-login-error">{errorMessage}</div>
          )}

          <div>
            <SubmitButton
              label="Create Account"
              status={submitStatus}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="ihub-login-footer">
          <p>
            Already have an account?{" "}
            <a href="/auth/login" className="ihub-link">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </form>
  );
};

export default SignupComponent;
