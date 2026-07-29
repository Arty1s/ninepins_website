import { LiveTeamDetail } from "@/components/live-team-detail";
import { defaultLiveData } from "@/lib/live-store";

export function generateStaticParams() {
  return defaultLiveData.teams.map((team) => ({ slug: team.slug }));
}

export default function TeamDetailPage({ params }: { params: { slug: string } }) {
  return <LiveTeamDetail slug={params.slug} />;
}
