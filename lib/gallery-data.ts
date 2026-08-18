export type GalleryCategory = "zapasy" | "turnaje" | "podujatia" | "zakulisie";

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  category: GalleryCategory;
  date: string;
  coverImage: string;
  photoCount: number;
  featured: boolean;
  photos: string[];
};

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  zapasy: "Zápas",
  turnaje: "Turnaj",
  podujatia: "Podujatie",
  zakulisie: "Zákulisie"
};

const lanePhotos = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/team-photo.jpg",
  "/images/players-action.jpg",
  "/images/trophies.jpg",
  "/images/club-building.jpg",
  "/images/hero-action.jpg"
];

export const galleryAlbums: GalleryAlbum[] = [
  {
    id: "album-1",
    slug: "kk-hlohovec-podbrezova",
    title: "KK Hlohovec - SK Zeleziarne Podbrezova",
    category: "zapasy",
    date: "12. maj 2024",
    coverImage: "/images/gallery-1.jpg",
    photoCount: 32,
    featured: true,
    photos: lanePhotos
  },
  {
    id: "album-2",
    slug: "priprava-pred-zapasom",
    title: "Priprava pred zapasom",
    category: "zakulisie",
    date: "10. maj 2024",
    coverImage: "/images/team-photo.jpg",
    photoCount: 18,
    featured: true,
    photos: ["/images/team-photo.jpg", "/images/players-action.jpg", "/images/gallery-2.jpg", "/images/hero-action.jpg"]
  },
  {
    id: "album-3",
    slug: "vitazi-pohara-slovenska-2024",
    title: "Vitazi Pohara Slovenska 2024",
    category: "turnaje",
    date: "5. maj 2024",
    coverImage: "/images/trophies.jpg",
    photoCount: 46,
    featured: true,
    photos: ["/images/trophies.jpg", "/images/team-photo.jpg", "/images/gallery-3.jpg", "/images/players-action.jpg"]
  },
  {
    id: "album-4",
    slug: "domaci-zapas-prva-liga",
    title: "Domaci zapas prvej ligy",
    category: "zapasy",
    date: "27. april 2024",
    coverImage: "/images/hero-action.jpg",
    photoCount: 24,
    photos: ["/images/hero-action.jpg", "/images/gallery-1.jpg", "/images/gallery-2.jpg"]
  },
  {
    id: "album-5",
    slug: "turnaj-mladych-hracov",
    title: "Turnaj mladych hracov",
    category: "turnaje",
    date: "20. april 2024",
    coverImage: "/images/players-action.jpg",
    photoCount: 28,
    photos: ["/images/players-action.jpg", "/images/team-photo.jpg", "/images/gallery-3.jpg"]
  },
  {
    id: "album-6",
    slug: "klubove-podujatie",
    title: "Klubove podujatie",
    category: "podujatia",
    date: "14. april 2024",
    coverImage: "/images/club-building.jpg",
    photoCount: 15,
    photos: ["/images/club-building.jpg", "/images/trophies.jpg", "/images/gallery-2.jpg"]
  },
  {
    id: "album-7",
    slug: "zapasova-atmosfera",
    title: "Zapasova atmosfera",
    category: "zapasy",
    date: "6. april 2024",
    coverImage: "/images/gallery-2.jpg",
    photoCount: 21,
    photos: ["/images/gallery-2.jpg", "/images/hero-action.jpg", "/images/gallery-1.jpg"]
  },
  {
    id: "album-8",
    slug: "timove-zakulisie",
    title: "Timove zakulisie",
    category: "zakulisie",
    date: "29. marec 2024",
    coverImage: "/images/gallery-3.jpg",
    photoCount: 19,
    photos: ["/images/gallery-3.jpg", "/images/team-photo.jpg", "/images/players-action.jpg"]
  },
  {
    id: "album-9",
    slug: "trofeje-a-uspechy",
    title: "Trofeje a uspechy",
    category: "podujatia",
    date: "18. marec 2024",
    coverImage: "/images/trophies.jpg",
    photoCount: 34,
    photos: ["/images/trophies.jpg", "/images/gallery-1.jpg", "/images/team-photo.jpg"]
  },
  {
    id: "album-10",
    slug: "treningova-sobota",
    title: "Treningova sobota",
    category: "zakulisie",
    date: "9. marec 2024",
    coverImage: "/images/hero-lane.jpg",
    photoCount: 16,
    photos: ["/images/hero-lane.jpg", "/images/club-building.jpg", "/images/gallery-2.jpg"]
  }
];
