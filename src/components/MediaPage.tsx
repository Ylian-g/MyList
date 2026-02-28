"use client";

import { useEffect, useState, useCallback } from "react";
import { MediaCard } from "./MediaCard";
import { MiniCard } from "./MiniCard";
import { Carousel } from "./Carousel";
import { Pagination } from "./Pagination";
import { AddModal } from "./AddModal";
import type { Media, Status, ExternalMedia } from "@/types";

interface MediaPageProps {
  mediaType: "ANIME" | "MANGA" | "GAME";
  apiPath: string;
  title: string;
  subtitle: string;
}

interface DiscoverResponse {
  items: ExternalMedia[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  myIds: string[];
  error?: string;
}

export function MediaPage({ mediaType, apiPath, title, subtitle }: MediaPageProps) {
  const [myList, setMyList] = useState<Media[]>([]);
  const [discover, setDiscover] = useState<DiscoverResponse | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [tab, setTab] = useState<"list" | "discover">("list");
  const [modalItem, setModalItem] = useState<ExternalMedia | null>(null);
  const [myIds, setMyIds] = useState<Set<string>>(new Set());

  const loadList = useCallback(async () => {
    const res = await fetch(`${apiPath}?list=1`);
    setMyList(await res.json());
  }, [apiPath]);

  const loadDiscover = useCallback(async (p: number, q?: string) => {
    setDiscoverLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set("search", q);
    const res = await fetch(`${apiPath}?${params}`);
    const data: DiscoverResponse = await res.json();
    setDiscover(data);
    setMyIds(new Set(data.myIds ?? []));
    setDiscoverLoading(false);
  }, [apiPath]);

  useEffect(() => {
    Promise.all([loadList(), loadDiscover(1)]).then(() => setLoading(false));
  }, [loadList, loadDiscover]);

  async function handleAdd(item: ExternalMedia, opts: { status: Status; rating: number | null; comment: string | null; isRewatch: boolean }) {
    await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, ...opts }),
    });
    setMyIds((prev) => new Set(prev).add(item.externalId));
    await loadList();
    setModalItem(null);
  }

  async function handleUpdate(
    id: number,
    data: { status: Status; rating: number | null; comment: string | null }
  ) {
    await fetch(apiPath, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await loadList();
  }

  async function handleRemove(id: number) {
    await fetch(`${apiPath}?id=${id}`, { method: "DELETE" });
    await Promise.all([loadList(), loadDiscover(page, search || undefined)]);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadDiscover(1, searchInput || undefined);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    loadDiscover(newPage, search || undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Group list by status
  const statusGroups: { key: Status; label: string }[] = [
    { key: "IN_PROGRESS", label: "EN COURS" },
    { key: "COMPLETED", label: "TERMINÉS" },
    { key: "PLANNED", label: "PLANIFIÉS" },
    { key: "PAUSED", label: "EN PAUSE" },
    { key: "DROPPED", label: "ABANDONNÉS" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <span className="loading loading-ring loading-lg text-primary" />
        <p className="font-display text-lg tracking-wider text-base-content/40">CHARGEMENT</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-wider">{title}</h1>
        <p className="mt-1 text-sm opacity-40">{subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => setTab("list")}
          className={`flex items-center gap-2 font-display text-lg tracking-wider transition-all ${
            tab === "list" ? "text-primary" : "text-base-content/30 hover:text-base-content/60"
          }`}
        >
          MA LISTE
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {myList.length}
          </span>
        </button>
        <span className="text-base-content/10">|</span>
        <button
          onClick={() => setTab("discover")}
          className={`flex items-center gap-2 font-display text-lg tracking-wider transition-all ${
            tab === "discover" ? "text-primary" : "text-base-content/30 hover:text-base-content/60"
          }`}
        >
          CATALOGUE
          {discover && discover.totalItems > 0 && (
            <span className="text-xs text-base-content/20">
              {discover.totalItems.toLocaleString()} titres
            </span>
          )}
        </button>
      </div>

      {/* ── DISCOVER TAB ── */}
      {tab === "discover" && (
        <div className="space-y-6 animate-fade-in">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher un titre..."
                className="input w-full border-white/10 bg-base-300/30 pl-10 placeholder:text-base-content/20 focus:border-primary/30 focus:outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/30"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <button type="submit" className="btn btn-primary">Chercher</button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                  loadDiscover(1);
                }}
                className="btn btn-ghost"
              >
                Effacer
              </button>
            )}
          </form>

          {/* Error message (e.g. RAWG not configured) */}
          {discover?.error && (
            <div className="glass-card flex items-center gap-3 rounded-xl p-4 border-warning/20">
              <span className="text-xl">⚠</span>
              <p className="text-sm text-warning">{discover.error}</p>
            </div>
          )}

          {/* Page info */}
          {discover && discover.totalPages > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-base-content/30">
                Page {discover.currentPage} sur {discover.totalPages}
                {search && (
                  <span className="ml-2 text-primary/60">
                    — Recherche : &ldquo;{search}&rdquo;
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Loading state */}
          {discoverLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-ring loading-lg text-primary" />
            </div>
          ) : discover && discover.items.length > 0 ? (
            <>
              {/* Carousel en haut */}
              <Carousel title="En vedette" badge={`Page ${page}`} badgeClass="badge-primary">
                {discover.items.map((item) => {
                  const inList = myIds.has(item.externalId);
                  return (
                    <MiniCard
                      key={`carousel-${item.externalId}`}
                      title={item.title}
                      imageUrl={item.imageUrl}
                      onClick={() => !inList && setModalItem(item)}
                      overlay={
                        inList ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-[10px] font-bold text-success-content shadow-lg">
                            ✓
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-content opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            +
                          </span>
                        )
                      }
                    />
                  );
                })}
              </Carousel>

              {/* Séparateur */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-display text-xs tracking-widest text-base-content/20">CATALOGUE COMPLET</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Grid */}
              <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {discover.items.map((item) => {
                  const inList = myIds.has(item.externalId);
                  return (
                    <MiniCard
                      key={item.externalId}
                      title={item.title}
                      imageUrl={item.imageUrl}
                      onClick={() => !inList && setModalItem(item)}
                      overlay={
                        inList ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-[10px] font-bold text-success-content shadow-lg">
                            ✓
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-content opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            +
                          </span>
                        )
                      }
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={Math.min(discover.totalPages, 500)}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="glass-card flex flex-col items-center gap-3 rounded-xl py-16">
              <span className="text-3xl opacity-20">∅</span>
              <p className="text-sm opacity-40">Aucun résultat</p>
            </div>
          )}
        </div>
      )}

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <div className="space-y-8 animate-fade-in">
          {myList.length === 0 ? (
            <div className="glass-card flex flex-col items-center gap-4 rounded-xl py-16">
              <span className="text-5xl opacity-10">空</span>
              <p className="text-sm opacity-40">Ta liste est vide</p>
              <button onClick={() => setTab("discover")} className="btn btn-primary btn-sm">
                Explorer le catalogue
              </button>
            </div>
          ) : (
            statusGroups.map(({ key, label }) => {
              const items = myList.filter((m) => m.status === key);
              if (items.length === 0) return null;
              return (
                <section key={key}>
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-display text-base tracking-wider text-base-content/50">
                      {label}
                    </h3>
                    <span className="text-xs text-base-content/20">{items.length}</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="stagger-children grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <MediaCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        imageUrl={item.imageUrl}
                        description={item.description}
                        status={item.status}
                        rating={item.rating}
                        comment={item.comment}
                        isRewatch={item.isRewatch}
                        onUpdate={(data) => handleUpdate(item.id, data)}
                        onRemove={() => handleRemove(item.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {modalItem && (
        <AddModal
          item={modalItem}
          onConfirm={(opts) => handleAdd(modalItem, opts)}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}
