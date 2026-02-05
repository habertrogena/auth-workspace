interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
}

export default function DashboardHeader({
  userName,
  userEmail,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Welcome, {userName}!
      </h1>
      <p className="text-slate-600">{userEmail}</p>
    </header>
  );
}
