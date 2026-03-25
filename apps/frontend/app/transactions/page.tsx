"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import BusinessLayout from "@/components/business/BusinessLayout";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionItem,
} from "@/lib/business-api";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date required"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { dateStyle: "short" });
}

export default function TransactionsPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: "EXPENSE",
      category: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

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

  const load = () => {
    if (user?.role !== "BUSINESS") return;
    setLoading(true);
    setError(null);
    fetchTransactions({
      type: filterType || undefined,
      from: filterFrom || undefined,
      to: filterTo || undefined,
    })
      .then(setList)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role !== "BUSINESS") return;
    load();
  }, [user?.role, filterType, filterFrom, filterTo]);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      amount: 0,
      type: "EXPENSE",
      category: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  const openEdit = (t: TransactionItem) => {
    setEditing(t);
    form.reset({
      amount: t.amount,
      type: t.type as "INCOME" | "EXPENSE",
      category: t.category,
      description: t.description ?? "",
      date: t.date.slice(0, 10),
    });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const date = new Date(values.date).toISOString();
      if (editing) {
        await updateTransaction(editing.id, {
          amount: values.amount,
          type: values.type,
          category: values.category,
          description: values.description || undefined,
          date,
        });
      } else {
        await createTransaction({
          amount: values.amount,
          type: values.type,
          category: values.category,
          description: values.description,
          date,
        });
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  });

  const onDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    setError(null);
    try {
      await deleteTransaction(id);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    }
  };

  if (isAuthLoading || (user && user.role !== "BUSINESS")) return <LoadingPage />;
  if (!user) return null;

  return (
    <BusinessLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold sm:text-2xl">Transactions</h1>
          <Button onClick={openCreate}>Add transaction</Button>
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <Input
            type="date"
            placeholder="From"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="max-w-[140px]"
          />
          <Input
            type="date"
            placeholder="To"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="max-w-[140px]"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-3">{formatDate(t.date)}</td>
                    <td className="px-4 py-3">{t.type}</td>
                    <td className="px-4 py-3">{t.category}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
                      {t.description || "—"}
                    </td>
                    <td className={`px-4 py-3 font-medium ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(t.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No transactions found.</p>
            )}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as "INCOME" | "EXPENSE")}
                    >
                      <option value="INCOME">Income</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </BusinessLayout>
  );
}
