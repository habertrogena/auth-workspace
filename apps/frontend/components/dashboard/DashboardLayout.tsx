import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
