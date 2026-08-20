import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  text,
  light = false,
  className
}: {
  eyebrow: string;
  title: string;
  text: string;
  light: boolean;
  className: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <p className={cn("mb-3 text-sm font-black uppercase", light ? "text-white/75" : "text-kkhc")}>{eyebrow}</p> : null}
      <h2 className={cn("sport-title text-4xl leading-none md:text-6xl", light ? "text-white" : "text-navy")}>{title}</h2>
      {text ? <p className={cn("mt-4 text-base leading-7", light ? "text-white/75" : "text-navy/70")}>{text}</p> : null}
    </div>
  );
}
