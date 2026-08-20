const LOGOS_BY_TEAM_ID: Record<number, string> = {
  4849: "MKKStarTur.png",
  4850: "TJSlavojVekari1.png",
  4851: "KKTrsten.png",
  4852: "PKKoice.png",
  4853: "ko_zarnovica.png",
  4854: "KKPobedim.png",
  4856: "KeleziarnePodbrezov1.png",
  4857: "KKZlatKlasy.png",
  4858: "KModranka.png",
  4859: "MKKPieany.png",
  4860: "TJLokomotvaVrtky1.png",
  4861: "KeleziarnePodbrezov1.png",
  4862: "TJRakovice.png",
  4863: "KKTrsten.png",
  4864: "ko_zarnovica.png",
  4866: "TKKTrenn.png",
  4867: "MKKPieany.png",
  4868: "TJLokomotvaVrtky1.png",
  4869: "KeleziarnePodbrezov1.png",
  4890: "KKZKABratislava.png",
  4891: "MKKStarTur.png",
  4892: "KKSlavojSldkoviovo.png",
  4893: "TJSlovanDusloaa.png",
  4894: "KKPreselany.png",
  4895: "TKKTrenn.png",
  4896: "KKPobedim.png",
  4897: "BKKBnovcenadBebravou.png",
  4898: "Priatelia.png",
  4899: "MKKStarTur.png",
  4900: "DKKNovMestonadVhom.png",
  4901: "KKZlatKlasy.png",
  4902: "MKKPieany.png",
  4903: "Priatelia.png",
  4904: "KKTatranBratislava.png",
  4913: "MKKStarTur.png",
  4914: "KKPobedim.png",
  4915: "MKKPieany.png",
  4916: "MKKSlovanGalanta.png",
  4917: "TJRakovice.png",
  4918: "KKInterBratislava7.png",
  4919: "ko_zarnovica.png",
  4920: "KModranka.png",
  4921: "TJSlovanDusloaa.png",
  4922: "KKZlatKlasy.png",
  4924: "TKKTrenn.png",
  4926: "KKCabajCapor.png",
  4927: "MKKSlovanGalanta.png",
  4928: "TJRakovice.png",
  4929: "KKSlviaNitra.png"
};

const LOGOS_BY_NAME: Array<[string, string]> = [
  ["zarnovica", "ko_zarnovica.png"],
  ["trstena", "KKTrsten.png"],
  ["velky saris", "TJSlavojVekari1.png"],
  ["stara tura", "MKKStarTur.png"],
  ["piestany", "MKKPieany.png"],
  ["modranka", "KModranka.png"],
  ["podbrezova", "KeleziarnePodbrezov1.png"],
  ["vrutky", "TJLokomotvaVrtky1.png"],
  ["rakovice", "TJRakovice.png"],
  ["pobedim", "KKPobedim.png"],
  ["zlate klasy", "KKZlatKlasy.png"],
  ["inter bratislava", "KKInterBratislava7.png"],
  ["priatelia bratislava", "Priatelia.png"],
  ["trencin", "TKKTrenn.png"],
  ["galanta", "MKKSlovanGalanta.png"],
  ["preselany", "KKPreselany.png"],
  ["sladkovicovo", "KKSlavojSldkoviovo.png"],
  ["sala", "TJSlovanDusloaa.png"],
  ["banovce nad bebravou", "BKKBnovcenadBebravou.png"],
  ["nove mesto nad vahom", "DKKNovMestonadVhom.png"],
  ["cabaj", "KKCabajCapor.png"],
  ["nitra", "KKSlviaNitra.png"],
  ["kosice", "PKKoice.png"]
];

export function resolveClubLogo(name: string, externalTeamId?: number | null, importedLogo?: string) {
  if (importedLogo) return importedLogo;
  if (normalizeClubName(name).includes("hlohovec")) return "/kkhc-logo.png";
  const byId = externalTeamId ? LOGOS_BY_TEAM_ID[externalTeamId] : undefined;
  if (byId) return clubFileUrl(byId);
  const normalized = normalizeClubName(name);
  const byName = LOGOS_BY_NAME.find(([key]) => normalized.includes(key))?.[1];
  return byName ? clubFileUrl(byName) : "";
}

function clubFileUrl(filename: string) {
  return `https://files.kolky.sk/results/clubs/${filename}`;
}

function normalizeClubName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
