/**
 * Admin API helpers for ForwardFlow Kenya dashboard.
 * All endpoints require admin JWT (cookie or Bearer).
 */
import { apiFetch } from "./api";

export interface AnalyticsOverview {
  totalBusinesses: number;
  activeSubscriptions: number;
  freeUsers: number;
  lockedAccounts: number;
}

export interface BusinessListItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  lastActiveAt: string | null;
  user: { id: string; name: string; email: string | null; username: string };
  subscriptions: Array<{
    id: string;
    planType: string;
    status: string;
    startDate: string;
    endDate: string | null;
  }>;
  lock: { isLocked: boolean; reason: string | null; lockedAt: string | null } | null;
  analytics: { lastLogin: string | null; totalTransactionsCount: number; lastSyncAt: string | null } | null;
}

export interface BusinessDetail extends BusinessListItem {
  subscriptions: Array<{
    id: string;
    planType: string;
    status: string;
    startDate: string;
    endDate: string | null;
  }>;
}

export function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiFetch<AnalyticsOverview>("/analytics/overview");
}

export function fetchBusinesses(): Promise<BusinessListItem[]> {
  return apiFetch<BusinessListItem[]>("/businesses");
}

export function fetchBusiness(id: string): Promise<BusinessDetail> {
  return apiFetch<BusinessDetail>(`/businesses/${id}`);
}

export function lockBusiness(id: string, reason?: string): Promise<BusinessDetail> {
  return apiFetch<BusinessDetail>(`/businesses/${id}/lock`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export function unlockBusiness(id: string): Promise<BusinessDetail> {
  return apiFetch<BusinessDetail>(`/businesses/${id}/unlock`, {
    method: "PATCH",
  });
}
