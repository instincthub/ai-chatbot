"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  reqOptions,
  API_HOST_URL,
  openToast,
  objectIsEmpty,
} from "@instincthub/react-ui/lib";
import {
  FormError,
  OrDivider,
  SubmitButton,
  IsUsernameEmailTaken,
  TextField,
  PasswordsMatch,
} from "@instincthub/react-ui";

interface SignUpResponse {
  username?: string;
  email?: string;
  message?: string;
  detail?: string;
  status?: number;
}

const SignupComponent: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState({});
  const { data: session, update: sessionUpdate } = useSession();
  const [usernameIsValid, setUsernameIsValid] = useState<boolean>(false);
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const [status, setStatus] = useState<number | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(0);

    const form = new FormData(e.currentTarget);
    form.set("provider", "instincthub");

    // const requestOptions = reqOptions("POST", form);
    const options: RequestInit = {
      method: "POST",
      headers: {},
      redirect: "follow",
      body: form,
    };

    const url = `${API_HOST_URL}authuser/signup/`;

    try {
      const newRequest = await fetch(url, options);
      const response: SignUpResponse = await newRequest.json();

      if (response.username) {
        // Login user if ID exists in response
        sessionUpdate({ info: response });
        openToast(`${response.username} created successfully`, 200);
        console.log(response);

        // Redirect user to verify email or dashboard
        // router.push(`/auth/verify-email?email=${response.email}`);
      } else {
        setStatus(response.status);
        openToast(JSON.stringify(response), 400);
        setError(response);
      }
    } catch (error) {
      setStatus(500);
      openToast("Network or server error", 500);
    }
  }

  const handleDisableBtn = () => {
    return !(usernameIsValid && emailIsValid);
  };

  return (
    <form onSubmit={handleSubmit} className="ihub-login-container">
      <div className="ihub-login-card">
        <div className="ihub-login-header">
          <h1>Create Account</h1>
          <p>Join InstinctHub with AI-enhanced security</p>
        </div>

        <div className="ihub-login-form">
          <div className="ihub-form-fields">
            <IsUsernameEmailTaken
              name="email"
              type="email"
              label="Email Address *"
              required={true}
              key={1}
            />

            <IsUsernameEmailTaken
              name="username"
              type="text"
              label="Username *"
              required={true}
              key={2}
            />

            <TextField
              name="first_name"
              type="text"
              label="First Name *"
              required={true}
            />

            <TextField
              name="last_name"
              type="text"
              label="Last Name *"
              required={true}
            />

            <TextField
              name="phone_number"
              type="tel"
              label="Phone Number"
              required={false}
            />

            <PasswordsMatch />
          </div>

          {!objectIsEmpty(error) && (
            <div className="ihub-login-error">
              <FormError errors={error} status={status} />
            </div>
          )}

          <div className="ihub-form-actions">
            <SubmitButton
              label="Create Account"
              status={status}
              // disabled={handleDisableBtn()}
            />
          </div>
        </div>

        <div className="ihub-login-footer">
          <OrDivider labels="Or signup with" />

          <p>
            Already have an account?{" "}
            <Link href="/auth/login" className="ihub-link">
              <b>Sign in here</b>
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default SignupComponent;
