export type LeagueTheme = {
  key: string;
  label: string;
  accent: string;
  badge: string;
  panel: string;
  panelSoft: string;
  button: string;
  text: string;
  ring: string;
};

const themes: Record<string, LeagueTheme> = {
  men: {
    key: "men",
    label: "Extraliga",
    accent: "#1688ff",
    badge: "bg-[#1688ff]/18 text-[#8fc6ff] ring-[#1688ff]/25",
    panel: "bg-[linear-gradient(135deg,#173b68_0%,#2d65a5_100%)]",
    panelSoft: "bg-[linear-gradient(180deg,rgba(10,47,105,.94)_0%,rgba(7,26,61,.94)_100%)]",
    button: "bg-[linear-gradient(135deg,#3474b9,#24588f)] shadow-[0_16px_34px_rgba(36,88,143,.20)] hover:bg-[#326ca8]",
    text: "text-[#1688ff]",
    ring: "ring-[#1688ff]/25"
  },
  women: {
    key: "women",
    label: "Extraliga",
    accent: "#8b5cf6",
    badge: "bg-violet-500/18 text-violet-200 ring-violet-400/25",
    panel: "bg-[linear-gradient(135deg,#49376d_0%,#75529b_100%)]",
    panelSoft: "bg-[linear-gradient(180deg,rgba(55,26,112,.94)_0%,rgba(23,14,57,.94)_100%)]",
    button: "bg-[linear-gradient(135deg,#8060a7,#624482)] shadow-[0_16px_34px_rgba(98,68,130,.18)] hover:bg-[#725395]",
    text: "text-violet-300",
    ring: "ring-violet-400/25"
  },
  second: {
    key: "second",
    label: "2. liga",
    accent: "#10b981",
    badge: "bg-emerald-500/18 text-emerald-200 ring-emerald-400/25",
    panel: "bg-[linear-gradient(135deg,#24584c_0%,#3b816e_100%)]",
    panelSoft: "bg-[linear-gradient(180deg,rgba(5,78,59,.94)_0%,rgba(6,46,40,.94)_100%)]",
    button: "bg-[linear-gradient(135deg,#438c77,#2c6959)] shadow-[0_16px_34px_rgba(44,105,89,.18)] hover:bg-[#397c69]",
    text: "text-emerald-300",
    ring: "ring-emerald-400/25"
  },
  third: {
    key: "third",
    label: "3. liga",
    accent: "#06b6d4",
    badge: "bg-cyan-500/18 text-cyan-200 ring-cyan-400/25",
    panel: "bg-[linear-gradient(135deg,#315b69_0%,#4c8495_100%)]",
    panelSoft: "bg-[linear-gradient(180deg,rgba(14,116,144,.94)_0%,rgba(8,51,68,.94)_100%)]",
    button: "bg-[linear-gradient(135deg,#4f8da0,#346b7c)] shadow-[0_16px_34px_rgba(52,107,124,.18)] hover:bg-[#427c8e]",
    text: "text-cyan-300",
    ring: "ring-cyan-400/25"
  },
  youth: {
    key: "youth",
    label: "Dorast",
    accent: "#f59e0b",
    badge: "bg-amber-500/18 text-amber-200 ring-amber-400/25",
    panel: "bg-[linear-gradient(135deg,#74502c_0%,#a9783c_100%)]",
    panelSoft: "bg-[linear-gradient(180deg,rgba(120,53,15,.94)_0%,rgba(69,26,3,.94)_100%)]",
    button: "bg-[linear-gradient(135deg,#b98745,#91612d)] shadow-[0_16px_34px_rgba(145,97,45,.18)] hover:bg-[#a47438]",
    text: "text-amber-300",
    ring: "ring-amber-400/25"
  },
  first: {
    key: "first",
    label: "1. liga",
    accent: "#60a5fa",
    badge: "bg-sky-500/18 text-sky-200 ring-sky-400/25",
    panel: "bg-[linear-gradient(135deg,#315a72_0%,#4b819f_100%)]",
    panelSoft: "bg-[linear-gradient(180deg,rgba(7,89,133,.94)_0%,rgba(12,38,69,.94)_100%)]",
    button: "bg-[linear-gradient(135deg,#38bdf8,#0369a1)] shadow-[0_16px_34px_rgba(56,189,248,.18)] hover:bg-sky-600",
    text: "text-sky-300",
    ring: "ring-sky-400/25"
  }
};

export function getLeagueTheme(value = ""): LeagueTheme {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("zen")) return themes.women;
  if (normalized.includes("dorast")) return themes.youth;
  if (normalized.includes("3.") || normalized.includes("3 liga") || normalized.includes("tretia")) return themes.third;
  if (normalized.includes("2.") || normalized.includes("2 liga") || normalized.includes("druha")) return themes.second;
  if (normalized.includes("1.") || normalized.includes("1 liga") || normalized.includes("1. kl")) return themes.first;
  return themes.men;
}
