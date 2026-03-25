"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";

/** Root: ADMIN sees admin dashboard; BUSINESS is redirected to /dashboard. */
export default function HomePage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isAuthLoading && user?.role === "BUSINESS") {
      router.push("/dashboard");
      return;
    }
    if (!isAuthLoading && user && user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  if (isAuthLoading && !user) return <LoadingPage />;
  if (!user) return null;
  if (user.role === "BUSINESS") return <LoadingPage />;
  if (user.role !== "ADMIN") return null;

  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}
