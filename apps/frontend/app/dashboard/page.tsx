"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import BusinessLayout from "@/components/business/BusinessLayout";
import { fetchDashboardSummary, type DashboardSummary } from "@/lib/business-api";
import { ApiError } from "@/lib/api";
import Link from "next/link";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function BusinessDashboardPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user?.role !== "BUSINESS") return;
    let cancelled = false;
    fetchDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load summary");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  if (isAuthLoading || (user && user.role !== "BUSINESS")) return <LoadingPage />;
  if (!user) return null;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>
        {error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {loading && !summary && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {summary && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.balance)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                <p className="text-2xl font-bold text-foreground">{summary.overdueInvoicesCount}</p>
                {summary.overdueInvoicesCount > 0 && (
                  <Link href="/invoices" className="mt-1 text-sm text-primary hover:underline">
                    View invoices
                  </Link>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Transactions</h2>
                <Link href="/transactions" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              {summary.recentTransactions.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">No transactions yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 pr-4 font-medium">Date</th>
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 pr-4 font-medium">Category</th>
                        <th className="pb-2 pr-4 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recentTransactions.map((t) => (
                        <tr key={t.id} className="border-b border-border/50">
                          <td className="py-2 pr-4 text-muted-foreground">{formatDate(t.date)}</td>
                          <td className="py-2 pr-4">{t.type}</td>
                          <td className="py-2 pr-4">{t.category}</td>
                          <td className={`py-2 font-medium ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                            {t.type === "INCOME" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </BusinessLayout>
  );
}
