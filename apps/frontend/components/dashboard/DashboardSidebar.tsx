"use client";

import UserCardModal from "./UserCard";
import { useAuth } from "@/context/useAuth";

export default function DashboardSidebar() {
  const { user } = useAuth();

  if (!user) return null; 

  return (
    <aside className="w-64 bg-white p-4 h-full flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Navigation</h2>

      <nav className="flex flex-col gap-2">
        <UserCardModal user={user} />
        <button className="p-2 text-left rounded hover:bg-slate-100">
          Another Link
        </button>
      </nav>
    </aside>
  );
}
