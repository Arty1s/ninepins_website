"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Camera, ChevronDown, ChevronLeft, ChevronRight, Grid2X2, Images, LayoutList, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { galleryAlbums, galleryCategoryLabels, type GalleryAlbum, type GalleryCategory } from "@/lib/gallery-data";
import { readLiveData, subscribeLiveData, type LiveGalleryAlbum } from "@/lib/live-store";

type FilterValue = "vsetky" | GalleryCategory;
type SortValue = "newest" | "oldest" | "az";
type ViewValue = "grid" | "compact";

const filters: { label: string; value: FilterValue }[] = [
  { label: "Všetky", value: "vsetky" },
  { label: "Zápasy", value: "zapasy" },
  { label: "Turnaje", value: "turnaje" },
  { label: "Podujatia", value: "podujatia" },
  { label: "Zákulisie", value: "zakulisie" }
];

const sortOptions = [
  { label: "Najnovšie", value: "newest" },
  { label: "Najstaršie", value: "oldest" },
  { label: "Názov A-Z", value: "az" }
];

const viewOptions = [
  { label: "Mriežka", value: "grid" },
  { label: "Kompaktné zobrazenie", value: "compact" }
];

export function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>(() => toGalleryAlbums(readLiveData().gallery));
  const [activeFilter, setActiveFilter] = useState<FilterValue>("vsetky");
  const [sort, setSort] = useState<SortValue>("newest");
  const [view, setView] = useState<ViewValue>("grid");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightbox, setLightbox] = useState<{ album: GalleryAlbum; index: number } | null>(null);

  useEffect(() => subscribeLiveData((data) => setAlbums(toGalleryAlbums(data.gallery))), []);

  const filteredAlbums = useMemo(() => {
    const albumOrder = new Map(albums.map((album, index) => [album.id, index]));
    const filtered = activeFilter === "vsetky" ? albums : albums.filter((album) => album.category === activeFilter);

    return [...filtered].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title, "sk");
      const first = albumOrder.get(a.id) ?? 0;
      const second = albumOrder.get(b.id) ?? 0;
      if (sort === "oldest") return second - first;
      return first - second;
    });
  }, [activeFilter, albums, sort]);

  useEffect(() => {
    setVisibleCount(8);
  }, [activeFilter, sort]);

  const featuredAlbums = filteredAlbums.filter((album) => album.featured).slice(0, 3);
  const regularAlbums = filteredAlbums.filter((album) => !album.featured).slice(0, visibleCount);

  function loadMore() {
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 5, filteredAlbums.length));
      setLoadingMore(false);
    }, 450);
  }

  return (
    <main className="relative overflow-hidden bg-[#020b18] pt-[82px] text-white">
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,11,24,.16)_0%,rgba(2,11,24,.84)_34%,rgba(2,11,24,.96)_100%),url('/images/login-bg.png')] bg-cover bg-left-top opacity-80"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(20,124,255,.16),transparent_30%),linear-gradient(180deg,rgba(2,11,24,.20),#020b18_76%)]" aria-hidden="true" />

      <section className="container-page relative z-10 min-h-screen py-14 lg:py-20">
        <div className="mx-auto max-w-[1080px]">
          <GalleryHero />

          <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <GalleryFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <GalleryToolbar sort={sort} setSort={setSort} view={view} setView={setView} />
          </div>

          {featuredAlbums.length > 0 ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {featuredAlbums.map((album) => (
                <FeaturedAlbumCard key={album.id} album={album} onOpen={() => setLightbox({ album, index: 0 })} />
              ))}
            </div>
          ) : null}

          <GalleryGrid albums={regularAlbums} view={view} onOpen={(album) => setLightbox({ album, index: 0 })} />

          {visibleCount < filteredAlbums.length ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                className="inline-flex h-12 min-w-64 items-center justify-center gap-3 rounded-lg border border-[#1683ff]/70 bg-[#071a33]/42 px-7 text-sm font-black uppercase tracking-[0.04em] text-[#1683ff] transition hover:-translate-y-0.5 hover:bg-[#1683ff] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1683ff]"
              >
                {loadingMore ? "Načítavam..." : "Načítať viac fotiek"} <ChevronDown size={18} />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {lightbox ? <GalleryLightbox lightbox={lightbox} setLightbox={setLightbox} /> : null}
    </main>
  );
}

function toGalleryAlbums(rows: LiveGalleryAlbum[]): GalleryAlbum[] {
  const source = rows.length ? rows : [];
  if (!source.length) return galleryAlbums;

  return source.map((album) => {
    const photos = album.photos.split(",").map((photo) => photo.trim()).filter(Boolean);
    return {
      id: String(album.id),
      slug: album.slug,
      title: album.title,
      category: album.category,
      date: album.date,
      coverImage: album.coverImage,
      photoCount: photos.length,
      featured: album.featured,
      photos: photos.length ? photos : [album.coverImage]
    };
  });
}

function GalleryHero() {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-[#1683ff]">Galéria</p>
      <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">Momenty, ktoré nás spájajú</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
        Fotky z turnajov, zápasov, podujatí a zákulisia nášho klubu.
        <br />
        Spomienky, ktoré žijú s nami.
      </p>
    </div>
  );
}

function GalleryFilters({ activeFilter, setActiveFilter }: { activeFilter: FilterValue; setActiveFilter: (value: FilterValue) => void }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filtrovať galériu">
      {filters.map((filter) => {
        const active = filter.value === activeFilter;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "h-11 shrink-0 rounded-lg border px-5 text-xs font-black uppercase tracking-[0.04em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1683ff]",
              active
                ? "border-[#1683ff] bg-[#1683ff] text-white shadow-[0_14px_34px_rgba(20,124,255,.30)]"
                : "border-white/14 bg-[#071a33]/50 text-white hover:border-[#1683ff]/70 hover:text-[#1683ff]"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function GalleryToolbar({
  sort,
  setSort,
  view,
  setView
}: {
  sort: SortValue;
  setSort: (value: SortValue) => void;
  view: ViewValue;
  setView: (value: ViewValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <label className="relative">
        <span className="sr-only">Zoradenie galérie</span>
        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortValue)}
          className="h-11 min-w-40 appearance-none rounded-lg border border-white/16 bg-[#071a33]/64 px-11 pr-9 text-sm text-white outline-none transition hover:border-[#1683ff]/70 focus:border-[#1683ff]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#071a33]">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
      </label>

      <label className="relative">
        <span className="sr-only">Typ zobrazenia</span>
        {view === "grid" ? (
          <Grid2X2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
        ) : (
          <LayoutList className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
        )}
        <select
          value={view}
          onChange={(event) => setView(event.target.value as ViewValue)}
          className="h-11 min-w-48 appearance-none rounded-lg border border-white/16 bg-[#071a33]/64 px-11 pr-9 text-sm text-white outline-none transition hover:border-[#1683ff]/70 focus:border-[#1683ff]"
        >
          {viewOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#071a33]">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
      </label>
    </div>
  );
}

function FeaturedAlbumCard({ album, onOpen }: { album: GalleryAlbum; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative h-[340px] overflow-hidden rounded-2xl border border-white/12 bg-[#071a33] text-left shadow-[0_20px_60px_rgba(0,0,0,.28)] transition hover:-translate-y-1 hover:border-[#1683ff]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1683ff]"
    >
      <Image src={album.coverImage} alt={album.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020b18] via-[#020b18]/28 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <CategoryBadge category={album.category} />
        <h2 className="mt-3 text-lg font-black text-white">{album.title}</h2>
        <div className="mt-3 flex items-center justify-between text-sm text-white/76">
          <span>{album.date}</span>
          <span className="inline-flex items-center gap-1.5">
            <Camera size={15} /> {album.photoCount}
          </span>
        </div>
      </div>
    </button>
  );
}

function GalleryGrid({ albums, view, onOpen }: { albums: GalleryAlbum[]; view: ViewValue; onOpen: (album: GalleryAlbum) => void }) {
  return (
    <div className={cn("mt-6 grid gap-4", view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" : "grid-cols-1 md:grid-cols-2")}>
      {albums.map((album) => (
        <GalleryAlbumCard key={album.id} album={album} compact={view === "grid"} onOpen={() => onOpen(album)} />
      ))}
    </div>
  );
}

function GalleryAlbumCard({ album, compact, onOpen }: { album: GalleryAlbum; compact: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/12 bg-[#071a33] text-left transition hover:-translate-y-1 hover:border-[#1683ff]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1683ff]",
        compact ? "h-56" : "h-44"
      )}
    >
      <Image src={album.coverImage} alt={album.title} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.06]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020b18]/92 via-[#020b18]/18 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <CategoryBadge category={album.category} />
        <h3 className="mt-3 translate-y-2 text-sm font-black text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">{album.title}</h3>
      </div>
    </button>
  );
}

function CategoryBadge({ category }: { category: GalleryCategory }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#1683ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.04em] text-white shadow-[0_10px_24px_rgba(20,124,255,.28)]">
      {galleryCategoryLabels[category]}
    </span>
  );
}

function GalleryLightbox({
  lightbox,
  setLightbox
}: {
  lightbox: { album: GalleryAlbum; index: number };
  setLightbox: (value: { album: GalleryAlbum; index: number } | null) => void;
}) {
  const { album, index } = lightbox;
  const photo = album.photos[index] ?? album.coverImage;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") setLightbox({ album, index: index === 0 ? album.photos.length - 1 : index - 1 });
      if (event.key === "ArrowRight") setLightbox({ album, index: index === album.photos.length - 1 ? 0 : index + 1 });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [album, index, setLightbox]);

  const previous = () => setLightbox({ album, index: index === 0 ? album.photos.length - 1 : index - 1 });
  const next = () => setLightbox({ album, index: index === album.photos.length - 1 ? 0 : index + 1 });

  return (
    <div className="fixed inset-0 z-[100] bg-[#020b18]/94 p-4 text-white backdrop-blur-md" role="dialog" aria-modal="true" aria-label={album.title}>
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <Link href="/galeria" onClick={() => setLightbox(null)} className="text-sm font-bold text-[#1683ff]">
              Galéria
            </Link>
            <h2 className="mt-1 text-xl font-black md:text-3xl">{album.title}</h2>
            <p className="mt-1 text-sm text-white/60">
              {album.date} - {galleryCategoryLabels[album.category]} - {album.photoCount} fotiek
            </p>
          </div>
          <button type="button" onClick={() => setLightbox(null)} className="grid h-11 w-11 place-items-center rounded-lg border border-white/12 bg-white/6 transition hover:bg-white/12" aria-label="Zavrieť galériu">
            <X size={22} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/12 bg-black">
          <Image src={photo} alt={`${album.title} - fotografia ${index + 1}`} fill sizes="100vw" className="object-contain" priority />
          <button type="button" onClick={previous} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#020b18]/70 text-white transition hover:bg-[#1683ff]" aria-label="Predchádzajúca fotka">
            <ChevronLeft size={26} />
          </button>
          <button type="button" onClick={next} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#020b18]/70 text-white transition hover:bg-[#1683ff]" aria-label="Ďalšia fotka">
            <ChevronRight size={26} />
          </button>
          <div className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#020b18]/78 px-4 py-2 text-sm font-bold text-white">
            <Images size={16} /> {index + 1} / {album.photos.length}
          </div>
        </div>
      </div>
    </div>
  );
}
