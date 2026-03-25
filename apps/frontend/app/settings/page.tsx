"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import BusinessLayout from "@/components/business/BusinessLayout";

export default function SettingsPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAuthLoading && user && user.role !== "BUSINESS") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  if (isAuthLoading || (user && user.role !== "BUSINESS")) return <LoadingPage />;
  if (!user) return null;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold sm:text-2xl">Settings</h1>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-muted-foreground">Settings and preferences will be available here.</p>
        </div>
      </div>
    </BusinessLayout>
  );
}
