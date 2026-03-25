"use client";

import { ReactNode, useState } from "react";
import BusinessNavbar from "./BusinessNavbar";
import BusinessSidebar from "./BusinessSidebar";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BusinessNavbar onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="relative flex flex-1">
        <BusinessSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
