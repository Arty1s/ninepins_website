import { MatchDetailPage } from "@/components/match-detail-page";

export default function ZapasDetail({ params }: { params: { matchId: string } }) {
  return <MatchDetailPage matchId={params.matchId} />;
}
