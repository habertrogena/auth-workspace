"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin, setStoredToken } from "@/hooks/useLogin";
import { useUser } from "@/hooks/useUser";
import { apiFetch, ApiError } from "@/lib/api";
import type { AuthUser, AuthContextType } from "./types";
import type { LoginFormValues } from "@/validation/login.schema";

function toLoginInput(values: LoginFormValues): { email?: string; username?: string; password: string } {
  const isEmail = values.emailOrUsername.includes("@");
  return {
    password: values.password,
    ...(isEmail ? { email: values.emailOrUsername } : { username: values.emailOrUsername }),
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { login: loginApi } = useLogin();
  const { getUser } = useUser();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = !!user;

  const runBootstrap = useCallback(async () => {
    const maxAttempts = 3;
    const retryDelayMs = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const me = await getUser();
        setUser(me);
        setIsAuthLoading(false);
        return;
      } catch (err) {
        setUser(null);
        if (err instanceof ApiError && err.status === 401) {
          setIsAuthLoading(false);
          return;
        }
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, retryDelayMs));
          continue;
        }
        setIsAuthLoading(false);
      }
    }
  }, [getUser]);

  useEffect(() => {
    runBootstrap();
  }, [runBootstrap]);

  async function login(data: LoginFormValues) {
    setIsAuthLoading(true);
    try {
      const res = await loginApi(toLoginInput(data));
      setUser(res.user as AuthUser);
      if (res.user.role === "BUSINESS") router.push("/dashboard");
      else router.push("/");
    } catch (err) {
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function logout() {
    try {
      await apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
    } catch {
      // Still clear local state so user isn't stuck if API fails
    } finally {
      setStoredToken(null);
      setUser(null);
      router.push("/login");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
