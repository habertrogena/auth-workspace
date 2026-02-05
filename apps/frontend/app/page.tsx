"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MainContent from "@/components/dashboard/MainContent";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/register");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading && !user) return <LoadingPage />;

  if (!user) return null;

  return (
    <DashboardLayout>
      <MainContent user={user} />
    </DashboardLayout>
  );
}
