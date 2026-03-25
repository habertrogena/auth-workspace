"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";

interface BusinessNavbarProps {
  onMenuClick?: () => void;
}

export default function BusinessNavbar({ onMenuClick }: BusinessNavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex w-full shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 py-3 shadow-sm sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link href="/dashboard" className="truncate text-sm font-medium text-foreground sm:text-base">
          {user ? `${user.name || user.email || "ForwardFlow"}` : "ForwardFlow"}
        </Link>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 sm:size-default" onClick={logout}>
        Logout
      </Button>
    </header>
  );
}
