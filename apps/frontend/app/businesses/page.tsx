"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  fetchBusinesses,
  lockBusiness,
  unlockBusiness,
  type BusinessListItem,
} from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, ChevronRight } from "lucide-react";

function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function BusinessesPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<BusinessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push("/login");
    if (!isAuthLoading && user && user.role !== "ADMIN") router.push("/login");
  }, [isAuthLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchBusinesses()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleLock(b: BusinessListItem) {
    setActionId(b.id);
    try {
      const updated = await lockBusiness(b.id);
      setList((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, lock: updated.lock } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lock failed");
    } finally {
      setActionId(null);
    }
  }

  async function handleUnlock(b: BusinessListItem) {
    setActionId(b.id);
    try {
      const updated = await unlockBusiness(b.id);
      setList((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, lock: updated.lock } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unlock failed");
    } finally {
      setActionId(null);
    }
  }

  if (isAuthLoading || !user) return <LoadingPage />;
  if (user.role !== "ADMIN") return null;

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Businesses</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage businesses and lock/unlock accounts
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
          <div className="rounded-lg border border-border bg-card overflow-hidden sm:rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 font-medium sm:px-4 sm:py-3">Name</th>
                    <th className="px-2 py-2 font-medium sm:px-4 sm:py-3">Owner</th>
                    <th className="px-2 py-2 font-medium sm:px-4 sm:py-3">Plan</th>
                    <th className="px-2 py-2 font-medium sm:px-4 sm:py-3">Status</th>
                    <th className="px-2 py-2 font-medium sm:px-4 sm:py-3">Last Active</th>
                    <th className="px-2 py-2 font-medium sm:px-4 sm:py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No businesses yet
                      </td>
                    </tr>
                  ) : (
                    list.map((b) => {
                      const sub = b.subscriptions?.[0];
                      const isLocked = b.lock?.isLocked ?? false;
                      return (
                        <tr
                          key={b.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            <Link
                              href={`/businesses/${b.id}`}
                              className="font-medium text-primary hover:underline truncate max-w-[120px] sm:max-w-none inline-block"
                            >
                              {b.name}
                            </Link>
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 truncate max-w-[100px] sm:max-w-none">
                            {b.user?.name ?? b.user?.email ?? b.user?.username ?? "—"}
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">{sub?.planType ?? "—"}</td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                isLocked
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {isLocked ? "Locked" : (sub?.status ?? "—")}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-muted-foreground sm:px-4 sm:py-3 whitespace-nowrap">
                            {formatDate(b.lastActiveAt)}
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                              {isLocked ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs sm:text-sm"
                                  disabled={actionId === b.id}
                                  onClick={() => handleUnlock(b)}
                                >
                                  <Unlock className="mr-0.5 h-3.5 w-3.5 sm:mr-1 sm:h-4 sm:w-4" />
                                  Unlock
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8 text-xs sm:text-sm"
                                  disabled={actionId === b.id}
                                  onClick={() => handleLock(b)}
                                >
                                  <Lock className="mr-0.5 h-3.5 w-3.5 sm:mr-1 sm:h-4 sm:w-4" />
                                  Lock
                                </Button>
                              )}
                              <Link href={`/businesses/${b.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
