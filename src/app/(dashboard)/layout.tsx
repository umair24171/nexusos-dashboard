import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
