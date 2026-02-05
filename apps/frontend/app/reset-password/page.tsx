import Link from "next/link";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invalid link</h1>
          <p className="text-slate-600 text-sm">
            This reset link is invalid or missing. Please request a new one from the login page.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-indigo-600 hover:underline"
          >
            Request reset link
          </Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link
            href="/login"
            className="inline-block text-indigo-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <ResetPasswordForm token={token} />
    </div>
  );
}
