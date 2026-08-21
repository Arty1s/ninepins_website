import { LiveTeamDetail } from "@/components/live-team-detail";
import { defaultLiveData } from "@/lib/live-store";

export function generateStaticParams() {
  const officialSlugs = ["extraliga-muzi", "extraliga-zeny", "druha-liga", "tretia-liga", "dorast"];
  return Array.from(new Set([...defaultLiveData.teams.map((team) => team.slug), ...officialSlugs])).map((slug) => ({ slug }));
}

export default function TeamDetailPage({ params }: { params: { slug: string } }) {
  return <LiveTeamDetail slug={params.slug} />;
}
