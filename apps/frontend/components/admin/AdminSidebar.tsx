"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, BarChart3, X } from "lucide-react";
import { useAuth } from "@/context/useAuth";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/businesses", label: "Businesses", icon: Building2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {onClose && (
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Sidebar: fixed overlay on mobile, static on lg */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card
          pt-14 transition-transform duration-200 ease-out
          lg:static lg:inset-auto lg:pt-0 lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                ForwardFlow Kenya
              </h2>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {nav.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
          {user && (
            <div className="border-t border-border p-4 text-sm text-muted-foreground">
              <p className="truncate font-medium text-foreground">{user.username}</p>
              <p className="text-xs">{user.role === "ADMIN" ? "Admin" : "User"}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
