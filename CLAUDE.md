# MyList

Application personnelle de suivi anime, manga et jeux vidéo (single-user, type MyAnimeList).

## Stack

- **Frontend/Backend** : Next.js 16 (App Router) avec API Routes
- **Runtime** : Bun
- **Style** : Tailwind CSS v4 + DaisyUI v5 (thèmes custom par page)
- **ORM** : Prisma 7 avec adapter `@prisma/adapter-pg`
- **DB** : PostgreSQL (Docker en local, Neon en prod)
- **APIs externes** : Jikan (anime/manga, gratuit sans clé) + RAWG (jeux, clé gratuite requise)

## Commandes

```bash
bun dev              # Dev server (turbopack)
bun run build        # Build production
bun run db:push      # Push schema Prisma vers la DB
bun run db:migrate   # Migration Prisma
bun run db:studio    # Prisma Studio (GUI DB)
docker compose up -d # Lancer PostgreSQL local
```

## Structure

```
src/
├── app/
│   ├── layout.tsx          # Layout + Navbar
│   ├── page.tsx            # Accueil (thème noir)
│   ├── anime/page.tsx      # Page anime (thème orange)
│   ├── manga/page.tsx      # Page manga (thème pourpre)
│   ├── games/page.tsx      # Page jeux (thème bleu)
│   └── api/
│       ├── anime/route.ts  # CRUD anime + browse paginé via Jikan
│       ├── manga/route.ts  # CRUD manga + browse paginé via Jikan
│       ├── games/route.ts  # CRUD jeux + browse paginé via RAWG
│       └── sync/route.ts   # Sync mensuelle recommandations
├── components/
│   ├── Navbar.tsx           # Navigation, change le data-theme dynamiquement
│   ├── MediaPage.tsx        # Page réutilisable (liste + catalogue paginé)
│   ├── MediaCard.tsx        # Card dans "Ma liste" (édition statut/note/commentaire)
│   ├── MiniCard.tsx         # Petite card image (catalogue + carousel)
│   ├── Carousel.tsx         # Scroll horizontal avec flèches
│   ├── Pagination.tsx       # Navigation par pages
│   ├── AddModal.tsx         # Modal d'ajout (statut, note, commentaire, rewatch)
│   └── StatusBadge.tsx      # Badge de statut coloré
├── lib/
│   ├── prisma.ts            # Client Prisma singleton (adapter-pg)
│   ├── jikan.ts             # API Jikan avec pagination
│   └── rawg.ts              # API RAWG avec pagination
└── types/
    └── index.ts             # Types partagés (ExternalMedia, PaginatedResponse)
```

## Conventions

- **Langue UI** : Français
- **Typographie** : Bebas Neue (titres) + DM Sans (corps)
- **Thèmes DaisyUI** : `mylist-home`, `mylist-anime`, `mylist-manga`, `mylist-games` — définis dans `globals.css`
- **Dark mode** : Toutes les pages sont en dark mode avec couleur d'accent différente
- **Animations** : CSS uniquement (fadeInUp, stagger-children, etc.) — pas de lib externe
- **Composants glass** : Classe `.glass-card` pour les cartes semi-transparentes

## Prisma

- Config dans `prisma.config.ts` (Prisma 7 — plus de `url` dans schema.prisma)
- Le client utilise `@prisma/adapter-pg` pour la connexion directe
- Deux modèles : `Media` (liste perso) et `MonthlyRecommendation` (sync mensuelle)
- Statuts : `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `PAUSED`, `DROPPED`

## Variables d'environnement

```
DATABASE_URL=postgresql://...
RAWG_API_KEY=...          # Clé gratuite depuis https://rawg.io/apidocs
```

## Notes

- API Jikan : rate limit 3 req/sec, pas de clé nécessaire
- API RAWG : clé obligatoire, message d'erreur affiché dans l'UI si non configurée
- Les scripts package.json utilisent `prisma` directement (pas `bunx`) car `bunx` n'est pas dans le PATH bash de WSL
- Le postinstall lance `prisma generate` automatiquement
