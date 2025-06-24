"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();

  // Use the requireAuth hook to handle authentication
  const auth = requireAuth(redirectTo);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via requireAuth hook
  }

  return <>{children}</>;
}
