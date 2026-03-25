"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAnalyticsOverview, type AnalyticsOverview } from "@/lib/admin-api";
import {
  Building2,
  CreditCard,
  Users,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboardContent() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsOverview()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading overview…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Businesses",
      value: stats?.totalBusinesses ?? 0,
      icon: Building2,
      href: "/businesses",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: CreditCard,
    },
    {
      title: "Free Users",
      value: stats?.freeUsers ?? 0,
      icon: Users,
    },
    {
      title: "Locked Accounts",
      value: stats?.lockedAccounts ?? 0,
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          ForwardFlow Kenya admin overview
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, value, icon: Icon, href }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {title}
                </p>
                <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{value}</p>
              </div>
              <div className="shrink-0 rounded-lg bg-primary/10 p-2 sm:p-3">
                <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
            </div>
            {href && (
              <Link
                href={href}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <Link
          href="/businesses"
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 sm:p-6"
        >
          <span className="font-medium text-sm sm:text-base">Businesses</span>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
        <Link
          href="/analytics"
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 sm:p-6"
        >
          <span className="font-medium text-sm sm:text-base">Analytics</span>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
