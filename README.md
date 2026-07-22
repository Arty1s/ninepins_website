# KK Hlohovec website

Moderný landing page pre Kolkársky klub Hlohovec postavený v Next.js, TypeScript a Tailwind CSS.

## Spustenie

```bash
npm install
npm run dev
```

Lokálne:

```bash
http://127.0.0.1:3000
```

Produkčný build:

```bash
npm run build
npm run start
```

## Dátová štruktúra

Editovateľné mock dáta pre homepage sú v:

```text
lib/landing-data.ts
```

Sú pripravené tak, aby sa neskôr dali nahradiť dátami z admin rozhrania, vlastného API alebo zdrojov ako `vysledky.kolky.sk`.

## Obrázky na výmenu za reálne klubové materiály

Nahraď tieto súbory v `public/images` reálnymi fotkami:

```text
hero-lane.jpg       - hlavná hero fotografia kolkárne alebo hráča v akcii
players-action.jpg  - široká promo fotografia pre členský banner
team-photo.jpg      - tímová fotografia
trophies.jpg        - poháre a medaily
club-building.jpg   - exteriér alebo interiér klubu
gallery-1.jpg
gallery-2.jpg
gallery-3.jpg
```

Klubové logo je v:

```text
public/kkhc-logo.png
```

## Dôležité trasy

```text
/
/timy
/hraci
/zapasy
/turnaje
/podujatia
/arena
/cennik
/kontakt
/prihlasenie
/registracia
```
