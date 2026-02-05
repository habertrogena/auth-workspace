"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/validation/forgot-password.schema";
import { useForgotPassword } from "@/hooks/useForgotPassword";

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

export default function ForgotPasswordForm() {
  const { requestReset, data: success, isLoading, isError } = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await requestReset(values.email);
      form.reset();
    } catch {
      // Error state is handled by the hook
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
        <p className="text-slate-600 text-sm">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {isError && (
          <p className="text-red-600 text-center font-medium">{isError}</p>
        )}
        {success && (
          <div className="space-y-2 rounded-lg bg-green-50 p-3 text-green-800 text-sm">
            <p>{success.message}</p>
            {success.resetLink && (
              <p className="break-all font-mono text-xs">
                <strong>Dev reset link:</strong>{" "}
                <a
                  href={success.resetLink}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {success.resetLink}
                </a>
              </p>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="you@example.com"
                  type="email"
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
          {isLoading ? "Sending..." : "Send reset link"}
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
