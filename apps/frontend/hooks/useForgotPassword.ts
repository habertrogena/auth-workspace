"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export type ForgotPasswordResponse = {
  message: string;
  resetLink?: string;
};

export function useForgotPassword() {
  const [data, setData] = useState<ForgotPasswordResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);

  const requestReset = async (email: string) => {
    setIsLoading(true);
    setIsError(null);
    setData(null);

    try {
      const result = await apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setData(result);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setIsError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestReset,
    data,
    isLoading,
    isError,
  };
}
