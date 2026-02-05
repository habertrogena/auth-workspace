"use client";

import DashboardCard from "./DashboardCard";
import type { AuthUser } from "@/context/types";

interface MainContentProps {
  user: AuthUser;
}

export default function MainContent({ user }: MainContentProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard title="Welcome">
        <p>Hello, {user.name || user.email}!</p>
        <p>Glad to see you on your dashboard.</p>
      </DashboardCard>

      <DashboardCard title="Your Info">
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        {typeof user.age === "number" && (
          <p>
            <strong>Age:</strong> {user.age}
          </p>
        )}
        {user.nationalID && (
          <p>
            <strong>ID:</strong> {user.nationalID}
          </p>
        )}
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
      </DashboardCard>

      <DashboardCard title="Quick Actions">
        <p>Here you can add any other cards or actions.</p>
      </DashboardCard>
    </div>
  );
}
