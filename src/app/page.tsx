"use client";

import { useEffect, useState } from "react";
import { Carousel } from "@/components/Carousel";
import { MiniCard } from "@/components/MiniCard";
import Image from "next/image";

interface Recommendation {
  id: number;
  externalId: string;
  type: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  isNew: boolean;
}

interface SeenItem {
  id: number;
  title: string;
  imageUrl: string | null;
  status: string;
  rating: number | null;
  type: string;
}

interface SyncData {
  month: number;
  anime: Recommendation[];
  manga: Recommendation[];
  games: Recommendation[];
  seen: {
    anime: SeenItem[];
    manga: SeenItem[];
    games: SeenItem[];
  };
}

const MONTH_NAMES = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planifié",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  PAUSED: "En pause",
  DROPPED: "Abandonné",
};

export default function HomePage() {
  const [data, setData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/sync");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  async function sync() {
    setSyncing(true);
    await fetch("/api/sync", { method: "POST" });
    await load();
    setSyncing(false);
  }

  useEffect(() => {
    load();
  }, []);

  const monthNum = data?.month ? data.month % 100 : 0;
  const year = data?.month ? Math.floor(data.month / 100) : 0;
  const monthLabel = monthNum > 0 ? `${MONTH_NAMES[monthNum]} ${year}` : "";

  const totalSeen =
    (data?.seen?.anime?.length ?? 0) +
    (data?.seen?.manga?.length ?? 0) +
    (data?.seen?.games?.length ?? 0);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-base-300 via-base-200 to-base-100 p-8 sm:p-12">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }} />

        <div className="relative flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.3em] text-primary/60 uppercase">
              Recommandations
            </p>
            <h1 className="font-display text-5xl tracking-wider sm:text-7xl">
              {monthLabel || "MYLIST"}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed opacity-40">
              Les nouveautés et classiques du mois en anime, manga et jeux vidéo.
              Synchronise pour récupérer les dernières sorties.
            </p>
          </div>
          <button
            onClick={sync}
            disabled={syncing}
            className="btn btn-primary btn-sm gap-2"
          >
            {syncing ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                Sync...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Synchroniser
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <span className="loading loading-ring loading-lg text-primary" />
          <p className="font-display tracking-wider text-base-content/30">CHARGEMENT</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* ── NOUVEAUTÉS ── */}
          <SectionBlock
            title="ANIME"
            href="/anime"
            items={data?.anime ?? []}
            accentClass="from-orange-500/20 to-transparent"
            badgeClass="badge-warning"
          />
          <SectionBlock
            title="MANGA"
            href="/manga"
            items={data?.manga ?? []}
            accentClass="from-purple-500/20 to-transparent"
            badgeClass="badge-secondary"
          />
          <SectionBlock
            title="JEUX"
            href="/games"
            items={data?.games ?? []}
            accentClass="from-blue-500/20 to-transparent"
            badgeClass="badge-info"
          />

          {/* ── DÉJÀ VUS ── */}
          {totalSeen > 0 && (
            <>
              <div className="flex items-center gap-3 pt-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-display text-sm tracking-widest text-base-content/30">
                  DÉJÀ VUS CE MOIS
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {(data?.seen?.anime?.length ?? 0) > 0 && (
                <SeenSection
                  title="ANIME REVUS"
                  items={data!.seen.anime}
                  accentClass="from-orange-500/10 to-transparent"
                />
              )}
              {(data?.seen?.manga?.length ?? 0) > 0 && (
                <SeenSection
                  title="MANGA REVUS"
                  items={data!.seen.manga}
                  accentClass="from-purple-500/10 to-transparent"
                />
              )}
              {(data?.seen?.games?.length ?? 0) > 0 && (
                <SeenSection
                  title="JEUX REJOUÉS"
                  items={data!.seen.games}
                  accentClass="from-blue-500/10 to-transparent"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Nouveautés section ── */
function SectionBlock({
  title,
  href,
  items,
  accentClass,
  badgeClass,
}: {
  title: string;
  href: string;
  items: Recommendation[];
  accentClass: string;
  badgeClass: string;
}) {
  return (
    <section className="relative">
      <div className={`absolute -left-4 top-0 h-24 w-24 rounded-full bg-gradient-to-br ${accentClass} blur-2xl`} />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl tracking-widest">{title}</h2>
            <span className="text-xs text-base-content/20">{items.length} titres</span>
          </div>
          <a
            href={href}
            className="flex items-center gap-1 text-xs text-primary/60 transition-colors hover:text-primary"
          >
            Voir tout
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </a>
        </div>

        {items.length === 0 ? (
          <div className="glass-card flex items-center justify-center rounded-xl py-8">
            <p className="text-sm opacity-30">Aucune recommandation — Synchronise pour commencer</p>
          </div>
        ) : (
          <Carousel
            title="Nouveautés"
            badge={`${items.length}`}
            badgeClass={badgeClass}
          >
            {items.map((item) => (
              <MiniCard
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
              />
            ))}
          </Carousel>
        )}
      </div>
    </section>
  );
}

/* ── Déjà vus section ── */
function SeenSection({
  title,
  items,
  accentClass,
}: {
  title: string;
  items: SeenItem[];
  accentClass: string;
}) {
  return (
    <section className="relative">
      <div className={`absolute -left-4 top-0 h-24 w-24 rounded-full bg-gradient-to-br ${accentClass} blur-2xl`} />

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-display text-xl tracking-widest text-base-content/60">{title}</h2>
          <span className="text-xs text-base-content/20">{items.length}</span>
        </div>

        <Carousel>
          {items.map((item) => (
            <div key={item.id} className="w-36 shrink-0">
              <div className="group relative overflow-hidden rounded-xl bg-base-300">
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover opacity-60 transition-opacity group-hover:opacity-90"
                      sizes="144px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-base-300 text-3xl text-base-content/10">
                      ?
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Rating badge */}
                  {item.rating != null && (
                    <div className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-[10px] font-bold text-primary-content shadow">
                      {item.rating}
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute right-1.5 top-1.5">
                    <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/80 backdrop-blur">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white/90 drop-shadow-lg">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
