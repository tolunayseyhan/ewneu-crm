import { Sidebar } from "@/components/layout/Sidebar";
import { CRMProvider } from "@/lib/crm-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CRMProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-64">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </CRMProvider>
  );
}
