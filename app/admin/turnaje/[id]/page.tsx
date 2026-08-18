import { AdminGate } from "@/components/admin-gate";
import { AdminTournamentDetail } from "@/components/admin-tournament-detail";

export default function AdminTournamentDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminGate>
      <AdminTournamentDetail tournamentId={Number(params.id)} />
    </AdminGate>
  );
}
