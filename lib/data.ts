import { Award, CalendarDays, CreditCard, Dumbbell, MapPin, Shield, Trophy, Users } from "lucide-react";

export const navLinks = [
  { label: "Domov", href: "/" },
  { label: "Tímy", href: "/teams" },
  { label: "Turnaje", href: "/tournaments" },
  { label: "Cenník", href: "/pricing" },
  { label: "Galéria", href: "/gallery" }
];

export const teams = [
  {
    slug: "dorastenecka-liga",
    name: "Dorastenecká liga",
    league: "Mládež a rozvoj",
    image: "/images/team-photo.jpg",
    description: "Priestor pre mladých hráčov a hráčky, ktorí sa učia techniku, disciplínu a klubové hodnoty od základov.",
    achievements: ["Pravidelný nábor nových talentov", "Účasť na mládežníckych turnajoch", "Individuálne úspechy doplní admin"],
    coach: "Tréner doplní admin",
    captain: "Kapitán dorastu doplní admin",
    members: ["Mladý hráč 1", "Mladý hráč 2", "Mladá hráčka 3", "Mladý hráč 4"],
    stats: { priemer: 462, zapasy: 12, vitazstva: 7 }
  },
  {
    slug: "zenska-extraliga",
    name: "Ženská extraliga",
    league: "Najvyššia ženská súťaž",
    image: "/images/players-action.jpg",
    description: "Ženský tím reprezentujúci Hlohovec v najvyššej súťaži so zameraním na stabilný výkon a tímovú kultúru.",
    achievements: ["Extraligové zápasy žien", "Turnajové výsledky doplní admin", "Osobné úspechy hráčok doplní admin"],
    coach: "Trénerka doplní admin",
    captain: "Kapitánka doplní admin",
    members: ["Hráčka 1", "Hráčka 2", "Hráčka 3", "Hráčka 4"],
    stats: { priemer: 574, zapasy: 16, vitazstva: 10 }
  },
  {
    slug: "prva-liga",
    name: "Prvá liga",
    league: "Súťažné družstvo",
    image: "/images/hero-action.jpg",
    description: "Skúsený súťažný tím postavený na pravidelnom tréningu, domácej sile a zápasovej disciplíne.",
    achievements: ["Ligové výsledky bude dopĺňať admin", "Detailné zápisnice budú prepojené so sekciou zápasy", "Tímové aj osobné úspechy pripravené na doplnenie"],
    coach: "Tréner doplní admin",
    captain: "Kapitán doplní admin",
    members: ["Hráč 1", "Hráč 2", "Hráč 3", "Hráč 4", "Hráč 5"],
    stats: { priemer: 612, zapasy: 18, vitazstva: 12 }
  },
  {
    slug: "druha-liga",
    name: "Druhá liga",
    league: "Seniorská liga",
    image: "/images/gallery-1.jpg",
    description: "Tím prepájajúci skúsených hráčov s novými členmi, ktorí sa pripravujú na vyššiu súťažnú záťaž.",
    achievements: ["Silná domáca bilancia", "Regionálne zápasy a turnaje", "Úspechy hráčov doplní admin"],
    coach: "Tréner doplní admin",
    captain: "Kapitán doplní admin",
    members: ["Hráč 1", "Hráč 2", "Hráč 3", "Hráč 4"],
    stats: { priemer: 548, zapasy: 20, vitazstva: 13 }
  },
  {
    slug: "tretia-liga",
    name: "Tretia liga",
    league: "Rozvojová súťaž",
    image: "/images/club-building.jpg",
    description: "Priestor pre členov, ktorí chcú pravidelne hrávať, zlepšovať techniku a zbierať zápasové skúsenosti.",
    achievements: ["Aktívna klubová základňa", "Priestor pre návrat hráčov aj nováčikov", "Výsledky doplní admin"],
    coach: "Tréner doplní admin",
    captain: "Kapitán doplní admin",
    members: ["Hráč 1", "Hráč 2", "Hráč 3", "Hráč 4"],
    stats: { priemer: 521, zapasy: 18, vitazstva: 9 }
  }
];

export const clubIntro = {
  eyebrow: "O klube",
  title: "Kolkársky klub pripravený rásť",
  text: "KK Hlohovec je domáci kolkársky klub pre súťažných hráčov, mládež, rodičov aj ľudí z mesta, ktorí chcú zažiť športovú komunitu. Sekcia je pripravená na reálne fotografie tímov, kolkárne, tréningov a klubových úspechov.",
  highlights: ["Domáca kolkáreň a tréningové zázemie", "Súťažné družstvá od dorastu po seniorské ligy", "Priestor pre fotky hráčov, tímov, trofejí a turnajov"],
  image: "/images/club-building.jpg"
};

export const tournaments = [
  { name: "Memoriál KK Hlohovec", date: "18. 7. 2026", location: "Bernolákova 720", status: "Pripravuje sa", fee: "15 €", capacity: "64 hráčov", type: "upcoming" },
  { name: "Letný pohár mesta", date: "29. 8. 2026", location: "Kolkáreň Hlohovec", status: "Registrácia otvorená", fee: "12 €", capacity: "48 hráčov", type: "upcoming" },
  { name: "Mestská liga - jarné kolo", date: "Máj 2026", location: "Hlohovec", status: "Prebieha", fee: "Tímová úhrada", capacity: "12 tímov", type: "current" },
  { name: "Vianočný turnaj", date: "December 2025", location: "Hlohovec", status: "Ukončené", fee: "10 €", capacity: "56 hráčov", type: "past" }
];

export const achievements = [
  { year: "1974", title: "Vznik klubovej tradície", place: "Hlohovec", important: true, description: "Začiatok organizovaného kolkárskeho športu v meste." },
  { year: "1988", title: "Prvé krajské tituly", place: "Krajská súťaž", important: false, description: "Klub sa stabilne zaradil medzi rešpektované tímy regiónu." },
  { year: "2004", title: "Modernizácia kolkárne", place: "Bernolákova", important: true, description: "Zlepšenie zázemia pre tréningy, súťaže a komunitné podujatia." },
  { year: "2016", title: "Mládežnícky program", place: "Hlohovec", important: false, description: "Rozšírenie práce s dorastom a školskými nábormi." },
  { year: "2024", title: "Silná súťažná sezóna", place: "Slovensko", important: true, description: "Viaceré tímové a individuálne pódiá naprieč kategóriami." }
];

export const pricing = [
  { title: "Členstvo", price: "19 € / mes.", description: "Pre aktívnych členov klubu s pravidelnými tréningmi.", features: ["Klubové tréningy", "Profil hráča", "História platieb", "Mesačné pripomienky"] },
  { title: "Hodinový vstup", price: "8 € / hod.", description: "Jednorazový vstup pre verejnosť alebo rekreačnú hru.", features: ["Rezervácia dráhy", "Základné vybavenie", "Platba kartou", "E-mail potvrdenie"] },
  { title: "Rezervácia priestorov", price: "od 60 €", description: "Firemné akcie, oslavy, školské turnaje a komunitné podujatia.", features: ["Využitie 4 dráh", "Skupinová kapacita", "Faktúra", "Organizačná podpora"] }
];

export const featureCards = [
  { title: "Tímy", text: "Súťažné kategórie pre všetky úrovne.", icon: Shield },
  { title: "Turnaje", text: "Pravidelné podujatia a registrácie online.", icon: Trophy },
  { title: "Tréningy", text: "Kvalitné tréningy a moderné zázemie.", icon: Dumbbell },
  { title: "Komunita", text: "Priateľská atmosféra a športový rast.", icon: Users }
];

export const stats = [
  { label: "rokov tradície", value: "50+", icon: Trophy },
  { label: "aktívnych členov", value: "100+", icon: Users },
  { label: "získaných ocenení", value: "200+", icon: Award },
  { label: "turnajov ročne", value: "25+", icon: CalendarDays }
];

export const adminSections = [
  "Tímy", "Hráči", "Turnaje", "Úspechy", "Mestská liga", "Cenník", "Používatelia", "Členské platby", "Galéria", "Homepage obsah"
];

export const roles = ["Admin", "Tréner", "Hráč", "Člen"];

export const cityLeagueRows = [
  { team: "Kolkári Centrum", played: 12, points: 28, score: "62:34" },
  { team: "Bernolákova A", played: 12, points: 25, score: "58:38" },
  { team: "Hlohovec Sever", played: 12, points: 21, score: "51:45" },
  { team: "Mladí Majstri", played: 12, points: 18, score: "47:49" }
];

export const matchArchive = [
  {
    slug: "ko-zarnovica-vs-kkz-hlohovec-a",
    status: "odohrané",
    league: "Extraliga muži",
    round: "22. kolo",
    season: "2025/2026",
    date: "18.04.2026",
    time: "14:04",
    location: "Žarnovica",
    home: { name: "KO Žarnovica", shortName: "KOŽ", badgeClass: "from-[#d41f2d] to-[#f8d83b]" },
    away: { name: "KKZ Hlohovec A", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#114bff]" },
    score: "7.0 : 1.0",
    points: "7.0 : 1.0",
    pins: "3 586 : 3 372",
    homePins: 3586,
    awayPins: 3372,
    sets: "14.0 : 10.0",
    fulls: "2 334 : 2 271",
    cleanup: "1 252 : 1 101",
    faults: "19 : 27",
    source: "vysledky.kolky.sk/match/detail/43531",
    sourceHref: "https://vysledky.kolky.sk/match/detail/43531/KO-Zarnovica-vs-KKZ-Hlohovec-A",
    progress: [0, 8, 10, 26, 18, 32, 35, 30, 78, 62, 54, 48, 46, 68, 51, 56, 72, 98, 104, 82, 90, 126, 162, 170, 132, 141, 166, 211],
    rows: [
      { homePlayer: "Jančovič Martin", homeFulls: 394, homeCleanup: 235, homeFaults: 3, homeTotal: 629, homeSets: "4.0", homePoints: "1.0", awayPlayer: "Novosad Róbert", awayFulls: 362, awayCleanup: 175, awayFaults: 5, awayTotal: 537, awaySets: "0.0", awayPoints: "0.0" },
      { homePlayer: "Nasvetr Dalibor", homeFulls: 378, homeCleanup: 196, homeFaults: 3, homeTotal: 574, homeSets: "1.0", homePoints: "0.0", awayPlayer: "Poláčik Roman", awayFulls: 373, awayCleanup: 215, awayFaults: 3, awayTotal: 588, awaySets: "3.0", awayPoints: "1.0" },
      { homePlayer: "Tkáč Ján", homeFulls: 392, homeCleanup: 190, homeFaults: 4, homeTotal: 582, homeSets: "2.0", homePoints: "1.0", awayPlayer: "Vlčko Jaroslav", awayFulls: 381, awayCleanup: 192, awayFaults: 1, awayTotal: 573, awaySets: "2.0", awayPoints: "0.0" },
      { homePlayer: "Klubert Dávid", homeFulls: 378, homeCleanup: 214, homeFaults: 4, homeTotal: 592, homeSets: "2.0", homePoints: "1.0", awayPlayer: "Jaderko Róbert", awayFulls: 392, awayCleanup: 182, awayFaults: 6, awayTotal: 574, awaySets: "2.0", awayPoints: "0.0" },
      { homePlayer: "Fúska Radoslav st.", homeFulls: 412, homeCleanup: 178, homeFaults: 5, homeTotal: 590, homeSets: "2.0", homePoints: "1.0", awayPlayer: "Šišan Michal", awayFulls: 390, awayCleanup: 151, awayFaults: 8, awayTotal: 541, awaySets: "2.0", awayPoints: "0.0" },
      { homePlayer: "Pašiak Tomáš", homeFulls: 380, homeCleanup: 239, homeFaults: 0, homeTotal: 619, homeSets: "3.0", homePoints: "1.0", awayPlayer: "Kadlečík Matúš", awayFulls: 373, awayCleanup: 186, awayFaults: 4, awayTotal: 559, awaySets: "1.0", awayPoints: "0.0" }
    ]
  },
  {
    slug: "kk-hlohovec-vs-tj-rakovice",
    status: "odohrané",
    league: "1. KL západ",
    round: "18. kolo",
    season: "2023/2024",
    date: "11.05.2024",
    time: "10:00",
    location: "Kolkáreň Hlohovec",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#114bff]" },
    away: { name: "TJ Rakovice", shortName: "TJR", badgeClass: "from-[#d51f31] to-[#7b111f]" },
    score: "6 : 2",
    points: "6 : 2",
    pins: "3372 : 3291",
    homePins: 3372,
    awayPins: 3291,
    sets: "placeholder",
    fulls: "Doplní admin",
    cleanup: "Doplní admin",
    faults: "Doplní admin",
    source: "import z vysledky.kolky.sk pripravený",
    sourceHref: "https://vysledky.kolky.sk/",
    progress: [0, 12, 22, 36, 48, 59, 72, 90, 116, 130, 146, 160],
    rows: []
  },
  {
    slug: "kk-hlohovec-vs-kk-trstena",
    status: "odohrané",
    league: "1. KL západ",
    round: "17. kolo",
    season: "2023/2024",
    date: "04.05.2024",
    time: "14:00",
    location: "Kolkáreň Hlohovec",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#114bff]" },
    away: { name: "KK Trstená", shortName: "TRS", badgeClass: "from-[#1f2937] to-[#64748b]" },
    score: "7 : 1",
    points: "7 : 1",
    pins: "3398 : 3230",
    homePins: 3398,
    awayPins: 3230,
    sets: "placeholder",
    fulls: "Doplní admin",
    cleanup: "Doplní admin",
    faults: "Doplní admin",
    source: "import z vysledky.kolky.sk pripravený",
    sourceHref: "https://vysledky.kolky.sk/",
    progress: [0, 15, 28, 44, 62, 86, 98, 124, 140, 172],
    rows: []
  },
  {
    slug: "kk-hlohovec-vs-kk-inter-bratislava",
    status: "odohrané",
    league: "1. KL západ",
    round: "16. kolo",
    season: "2023/2024",
    date: "27.04.2024",
    time: "10:00",
    location: "Kolkáreň Hlohovec",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#114bff]" },
    away: { name: "KK Inter Bratislava", shortName: "INT", badgeClass: "from-[#0f172a] to-[#334155]" },
    score: "5 : 3",
    points: "5 : 3",
    pins: "3301 : 3250",
    homePins: 3301,
    awayPins: 3250,
    sets: "placeholder",
    fulls: "Doplní admin",
    cleanup: "Doplní admin",
    faults: "Doplní admin",
    source: "import z vysledky.kolky.sk pripravený",
    sourceHref: "https://vysledky.kolky.sk/",
    progress: [0, 11, 24, 30, 48, 66, 72, 88, 94, 128],
    rows: []
  },
  {
    slug: "kk-hlohovec-vs-skk-trnava",
    status: "plánované",
    league: "2. liga západ",
    round: "18. kolo",
    season: "2026/2027",
    date: "25.05.2026",
    time: "10:00",
    location: "Kolkáreň Hlohovec",
    home: { name: "KK Hlohovec", shortName: "KKH", badgeClass: "from-[#071a3d] to-[#114bff]" },
    away: { name: "ŠKK Trnava", shortName: "TRN", badgeClass: "from-[#15803d] to-[#064e3b]" },
    score: "vs",
    points: "Zápas sa pripravuje",
    pins: "-",
    homePins: 0,
    awayPins: 0,
    sets: "-",
    fulls: "-",
    cleanup: "-",
    faults: "-",
    source: "program doplní admin",
    sourceHref: "https://vysledky.kolky.sk/",
    progress: [],
    rows: []
  }
];

export const galleryAlbums = [
  { title: "Memoriál KKHC", tag: "Turnaj 2026", image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6auto=format&fit=crop&w=1200&q=80" },
  { title: "Extraliga doma", tag: "Tímy", image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84dauto=format&fit=crop&w=1200&q=80" },
  { title: "Mládežnícky tréning", tag: "Dorast", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377auto=format&fit=crop&w=1200&q=80" },
  { title: "Mestská liga", tag: "Hlohovec", image: "https://images.unsplash.com/photo-1519861531473-9200262188bfauto=format&fit=crop&w=1200&q=80" }
];

export const integrations = [
  { name: "Supabase", detail: "Auth, databáza, úložisko fotiek a role.", icon: Shield },
  { name: "Stripe", detail: "Členstvá, vstupy, faktúry a história platieb.", icon: CreditCard },
  { name: "Resend", detail: "Potvrdenia rezervácií, pripomienky a notifikácie.", icon: CalendarDays },
  { name: "Google Maps", detail: "Mapa klubu a plánovanie trasy.", icon: MapPin }
];
