"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/validation/reset-password.schema";
import { useResetPassword } from "@/hooks/useResetPassword";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function ResetPasswordForm({ token }: { token: string }) {
  const { resetPassword, isSuccess, isLoading, isError } = useResetPassword(token);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    try {
      await resetPassword(values.newPassword);
      form.reset();
    } catch {
      // Error state is handled by the hook
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Password reset</h1>
        <p className="rounded-lg bg-green-50 p-3 text-green-800 text-sm">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
        <p className="text-slate-600 text-sm">
          Enter your new password below.
        </p>

        {isError && (
          <div className="space-y-2">
            <p className="text-red-600 text-center font-medium">{isError}</p>
            <p className="text-center text-sm text-slate-600">
              Link expired or invalid?{" "}
              <Link href="/forgot-password" className="text-indigo-600 hover:underline">
                Request a new reset link
              </Link>
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="********"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  value={field.value ?? ""}
                  placeholder="********"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>

        <p className="text-center text-slate-600 text-sm">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </Form>
  );
}
