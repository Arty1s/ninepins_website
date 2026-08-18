import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant: "primary" | "secondary" | "outline" | "ghost";
  className: string;
};

const variants = {
  primary: "border-[#1683ff] bg-[#147cff] text-white shadow-[0_14px_34px_rgba(20,124,255,.34)] hover:border-[#42a0ff] hover:bg-[#238bff] hover:shadow-[0_18px_46px_rgba(20,124,255,.42)]",
  secondary: "border-white/22 bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14)] hover:border-[#1683ff] hover:bg-[#147cff] hover:text-white",
  outline: "border-[#1677ff]/45 bg-transparent text-[#1677ff] hover:border-[#1677ff] hover:bg-[#1677ff] hover:text-white hover:shadow-[0_14px_34px_rgba(20,124,255,.22)]",
  ghost: "border-transparent bg-transparent text-navy hover:bg-[#edf5ff] hover:text-[#1677ff]"
};

export function Button({ children, href, variant = "primary", className }: ButtonProps) {
  const classes = cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-6 text-sm font-black uppercase tracking-normal transition duration-200 hover:-translate-y-0.5 active:translate-y-0",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
