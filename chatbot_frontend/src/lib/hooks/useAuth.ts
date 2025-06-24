"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = !!session;
  const isLoading = status === "loading";

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return result;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const requireAuth = (redirectTo = "/auth/login") => {
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push(redirectTo);
      }
    }, [status, router, redirectTo]);

    return { isAuthenticated, isLoading, session };
  };

  return {
    session,
    isAuthenticated,
    isLoading,
    status,
    login,
    logout,
    requireAuth,
  };
}
