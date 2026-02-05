import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { LoginInput } from "@/interface/login";
import { User } from "@/interface/user";

export function useLogin() {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    setIsError(null);

    try {
      const user = await apiFetch<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });

      setData(user);
      return user;
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
