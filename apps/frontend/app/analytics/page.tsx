"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAnalyticsOverview, type AnalyticsOverview } from "@/lib/admin-api";

export default function AnalyticsPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push("/login");
    if (!isAuthLoading && user && user.role !== "ADMIN") router.push("/login");
  }, [isAuthLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchAnalyticsOverview()
      .then(setOverview)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [user]);

  if (isAuthLoading || !user) return <LoadingPage />;
  if (user.role !== "ADMIN") return null;

  const total = overview?.totalBusinesses ?? 0;
  const active = overview?.activeSubscriptions ?? 0;
  const free = overview?.freeUsers ?? 0;
  const locked = overview?.lockedAccounts ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Analytics</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Growth and usage overview
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Total Businesses
                </p>
                <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{total}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Active Subscriptions
                </p>
                <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{active}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Free Users
                </p>
                <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{free}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Locked Accounts
                </p>
                <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{locked}</p>
              </div>
            </div>

            {/* Simple bar chart: distribution */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
              <h2 className="mb-3 font-medium text-foreground text-sm sm:text-base sm:mb-4">
                Overview distribution
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Businesses</span>
                    <span className="font-medium">{total}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: total > 0 ? "100%" : "0%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Active subs</span>
                    <span className="font-medium">{active}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{
                        width: total ? `${(active / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Free users</span>
                    <span className="font-medium">{free}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-3"
                      style={{
                        width: total ? `${(free / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Locked</span>
                    <span className="font-medium">{locked}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-destructive/80"
                      style={{
                        width: total ? `${(locked / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
