import Image from "next/image";
import { resolveClubLogo } from "@/lib/club-logos";

export function ClubLogo({ name, externalTeamId, logoUrl, light = false }: { name: string; externalTeamId?: number | null; logoUrl?: string; light?: boolean }) {
  const source = resolveClubLogo(name, externalTeamId, logoUrl);
  if (!source) return null;

  return (
    <span className={`mx-auto grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full p-1.5 ring-1 ${light ? "bg-white ring-[#071a3d]/10" : "bg-white/95 ring-white/20"}`}>
      <Image src={source} alt={`Logo ${name}`} width={48} height={48} unoptimized className="h-full w-full object-contain" />
    </span>
  );
}
