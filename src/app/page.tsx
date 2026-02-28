"use client";

import { useEffect, useState } from "react";
import { Carousel } from "@/components/Carousel";
import { MiniCard } from "@/components/MiniCard";

interface Recommendation {
  id: number;
  externalId: string;
  type: string;
  title: string;
  imageUrl: string | null;
  description: string | null;
  isNew: boolean;
}

interface SyncData {
  month: number;
  anime: Recommendation[];
  manga: Recommendation[];
  games: Recommendation[];
}

const MONTH_NAMES = [
  "", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

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

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-base-300 via-base-200 to-base-100 p-8 sm:p-12">
        {/* Background pattern */}
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
          <p className="font-display tracking-wider text-base-content/30">
            CHARGEMENT
          </p>
        </div>
      ) : (
        <div className="space-y-12">
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
        </div>
      )}
    </div>
  );
}

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
  const newItems = items.filter((i) => i.isNew);
  const rewatchItems = items.filter((i) => !i.isNew);

  return (
    <section className="relative">
      {/* Accent glow */}
      <div className={`absolute -left-4 top-0 h-24 w-24 rounded-full bg-gradient-to-br ${accentClass} blur-2xl`} />

      <div className="relative">
        {/* Section header */}
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
          <div className="space-y-6">
            {newItems.length > 0 && (
              <Carousel
                title="Nouveautés"
                badge={`${newItems.length}`}
                badgeClass={badgeClass}
              >
                {newItems.map((item) => (
                  <MiniCard
                    key={item.id}
                    title={item.title}
                    imageUrl={item.imageUrl}
                  />
                ))}
              </Carousel>
            )}

            {rewatchItems.length > 0 && (
              <Carousel title="Classiques">
                {rewatchItems.map((item) => (
                  <MiniCard
                    key={item.id}
                    title={item.title}
                    imageUrl={item.imageUrl}
                  />
                ))}
              </Carousel>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
