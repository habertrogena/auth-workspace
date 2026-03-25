"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchBusiness, type BusinessDetail } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function formatDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BusinessDetailPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push("/login");
    if (!isAuthLoading && user && user.role !== "ADMIN") router.push("/login");
  }, [isAuthLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!id || !user || user.role !== "ADMIN") return;
    fetchBusiness(id)
      .then(setBusiness)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (isAuthLoading || !user) return <LoadingPage />;
  if (user.role !== "ADMIN") return null;

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Businesses
        </Link>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : business ? (
          <>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 break-words sm:text-2xl">
                {business.name}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">Business details</p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
                <h2 className="mb-3 font-medium text-foreground text-sm sm:text-base sm:mb-4">Business Info</h2>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{business.type}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{formatDate(business.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Active</dt>
                    <dd>{formatDate(business.lastActiveAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
                <h2 className="mb-3 font-medium text-foreground text-sm sm:text-base sm:mb-4">Owner</h2>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{business.user?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{business.user?.email ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Username</dt>
                    <dd>{business.user?.username ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
              <h2 className="mb-3 font-medium text-foreground text-sm sm:text-base sm:mb-4">Subscription</h2>
              {business.subscriptions?.length ? (
                <ul className="space-y-3">
                  {business.subscriptions.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-3 text-sm"
                    >
                      <span className="font-medium">{sub.planType}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          sub.status === "ACTIVE"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-muted-foreground">
                        Start: {formatDate(sub.startDate)}
                      </span>
                      {sub.endDate && (
                        <span className="text-muted-foreground">
                          End: {formatDate(sub.endDate)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No subscription</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:rounded-xl sm:p-6">
              <h2 className="mb-3 font-medium text-foreground text-sm sm:text-base sm:mb-4">
                Activity & Lock
              </h2>
              <dl className="space-y-2 text-sm">
                {business.analytics && (
                  <>
                    <div>
                      <dt className="text-muted-foreground">Last Login</dt>
                      <dd>{formatDate(business.analytics.lastLogin)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Total Transactions (count)
                      </dt>
                      <dd>{business.analytics.totalTransactionsCount}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Last Sync</dt>
                      <dd>{formatDate(business.analytics.lastSyncAt)}</dd>
                    </div>
                  </>
                )}
                {business.lock && (
                  <div>
                    <dt className="text-muted-foreground">Locked</dt>
                    <dd>
                      {business.lock.isLocked ? (
                        <span className="text-destructive">
                          Yes
                          {business.lock.reason &&
                            ` — ${business.lock.reason}`}
                          {business.lock.lockedAt &&
                            ` (${formatDate(business.lock.lockedAt)})`}
                        </span>
                      ) : (
                        "No"
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Business not found
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
