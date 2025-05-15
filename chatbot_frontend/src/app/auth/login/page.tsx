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
