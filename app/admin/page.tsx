import { AdminDashboardShell } from "@/components/admin-dashboard-shell";
import { AdminGate } from "@/components/admin-gate";

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDashboardShell />
    </AdminGate>
  );
}
