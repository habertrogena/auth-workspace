"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { LoadingPage } from "@/components/ui/loading-spinner";
import BusinessLayout from "@/components/business/BusinessLayout";
import {
  fetchInvoices,
  fetchCustomers,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  type InvoiceItem,
  type CustomerItem,
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

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(n);
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { dateStyle: "short" });
}

export default function InvoicesPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      amount: 0,
      dueDate: new Date().toISOString().slice(0, 10),
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
    Promise.all([fetchInvoices(), fetchCustomers()])
      .then(([invoices, cust]) => {
        setList(invoices);
        setCustomers(cust);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role !== "BUSINESS") return;
    load();
  }, [user?.role]);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      customerId: customers[0]?.id ?? "",
      amount: 0,
      dueDate: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  const openEdit = (inv: InvoiceItem) => {
    setEditing(inv);
    form.reset({
      customerId: inv.customerId,
      amount: inv.amount,
      dueDate: inv.dueDate.slice(0, 10),
    });
    setModalOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const dueDate = new Date(values.dueDate).toISOString();
      if (editing) {
        await updateInvoice(editing.id, {
          customerId: values.customerId,
          amount: values.amount,
          dueDate,
        });
      } else {
        await createInvoice({
          customerId: values.customerId,
          amount: values.amount,
          dueDate,
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

  const markPaid = async (inv: InvoiceItem) => {
    if (inv.status === "PAID") return;
    setError(null);
    try {
      await updateInvoice(inv.id, { status: "PAID" });
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Update failed");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    setError(null);
    try {
      await deleteInvoice(id);
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
          <h1 className="text-xl font-semibold sm:text-2xl">Invoices</h1>
          <Button onClick={openCreate} disabled={customers.length === 0}>
            {customers.length === 0 ? "Add customers first" : "Create invoice"}
          </Button>
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Due date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((inv) => (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{inv.customer.name}</td>
                    <td className="px-4 py-3">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          inv.status === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {inv.status === "UNPAID" && (
                          <Button variant="outline" size="sm" onClick={() => markPaid(inv)}>
                            Mark paid
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openEdit(inv)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(inv.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No invoices yet.</p>
            )}
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit invoice" : "Create invoice"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">Select customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
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
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
