"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type ResetPasswordResponse = {
  message: string;
};

export function useResetPassword(token: string) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);

  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    setIsError(null);

    try {
      await apiFetch<ResetPasswordResponse>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setIsError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    isSuccess,
    isLoading,
    isError,
  };
}
