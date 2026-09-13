import { LiveTeamDetail } from "@/components/live-team-detail";
import { defaultLiveData } from "@/lib/live-store";

export function generateStaticParams() {
  const officialSlugs = ["prva-liga", "druha-liga", "dorast", "extraliga-muzi", "extraliga-zeny", "tretia-liga"];
  return Array.from(new Set([...defaultLiveData.teams.map((team) => team.slug), ...officialSlugs])).map((slug) => ({ slug }));
}

export default function TeamDetailPage({ params }: { params: { slug: string } }) {
  return <LiveTeamDetail slug={params.slug} />;
}
