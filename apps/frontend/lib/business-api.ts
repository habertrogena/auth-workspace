/**
 * Business dashboard API client. Uses credentials (cookie) and optional Bearer token.
 */
import { getStoredToken } from "@/hooks/useLogin";
import { ApiError } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4200";
const DEFAULT_TIMEOUT_MS = 30_000;

async function businessFetch<T>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const token = getStoredToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...init,
      credentials: "include",
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const raw = body?.message;
      const message = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.join(", ") : "Request failed";
      throw new ApiError(message, res.status);
    }
    return res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof ApiError) throw e;
    throw new Error("Server is unreachable. Please try again later.");
  }
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  recentTransactions: { id: string; amount: number; type: string; category: string; description: string | null; date: string }[];
  overdueInvoicesCount: number;
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return businessFetch<DashboardSummary>("/dashboard/summary");
}

export interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
}

export function fetchTransactions(params?: { type?: string; from?: string; to?: string }): Promise<TransactionItem[]> {
  const sp = new URLSearchParams();
  if (params?.type) sp.set("type", params.type);
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  const q = sp.toString();
  return businessFetch<TransactionItem[]>(`/transactions${q ? `?${q}` : ""}`);
}

export function createTransaction(body: {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  date: string;
}): Promise<TransactionItem> {
  return businessFetch<TransactionItem>("/transactions", { method: "POST", body: JSON.stringify(body) });
}

export function updateTransaction(
  id: string,
  body: Partial<{ amount: number; type: "INCOME" | "EXPENSE"; category: string; description: string; date: string }>,
): Promise<TransactionItem> {
  return businessFetch<TransactionItem>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteTransaction(id: string): Promise<{ deleted: boolean }> {
  return businessFetch<{ deleted: boolean }>(`/transactions/${id}`, { method: "DELETE" });
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

export function fetchCustomers(): Promise<CustomerItem[]> {
  return businessFetch<CustomerItem[]>("/customers");
}

export function createCustomer(body: { name: string; phone?: string; email?: string }): Promise<CustomerItem> {
  return businessFetch<CustomerItem>("/customers", { method: "POST", body: JSON.stringify(body) });
}

export function updateCustomer(
  id: string,
  body: Partial<{ name: string; phone: string; email: string }>,
): Promise<CustomerItem> {
  return businessFetch<CustomerItem>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteCustomer(id: string): Promise<{ deleted: boolean }> {
  return businessFetch<{ deleted: boolean }>(`/customers/${id}`, { method: "DELETE" });
}

export interface InvoiceItem {
  id: string;
  customerId: string;
  customer: { id: string; name: string; email: string | null; phone: string | null };
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export function fetchInvoices(): Promise<InvoiceItem[]> {
  return businessFetch<InvoiceItem[]>("/invoices");
}

export function createInvoice(body: { customerId: string; amount: number; dueDate: string }): Promise<InvoiceItem> {
  return businessFetch<InvoiceItem>("/invoices", { method: "POST", body: JSON.stringify(body) });
}

export function updateInvoice(
  id: string,
  body: Partial<{ customerId: string; amount: number; status: "PAID" | "UNPAID"; dueDate: string }>,
): Promise<InvoiceItem> {
  return businessFetch<InvoiceItem>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteInvoice(id: string): Promise<{ deleted: boolean }> {
  return businessFetch<{ deleted: boolean }>(`/invoices/${id}`, { method: "DELETE" });
}
