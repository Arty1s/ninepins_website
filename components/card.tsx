import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-navy/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-premium", className)}>{children}</div>;
}
