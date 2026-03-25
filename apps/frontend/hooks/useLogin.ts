import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { LoginInput } from "@/interface/login";
import { User } from "@/interface/user";

export interface LoginResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = "forwardflow_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function useLogin() {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    setIsError(null);

    try {
      const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });

      setStoredToken(res.token ?? null);
      setData(res.user);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setIsError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    data,
    isLoading,
    isError,
  };
}
