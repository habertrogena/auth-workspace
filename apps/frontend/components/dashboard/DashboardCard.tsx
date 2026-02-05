import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
}

export default function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
