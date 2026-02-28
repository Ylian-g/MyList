import type { ExternalMedia, PaginatedResponse } from "@/types";

const BASE_URL = "https://api.jikan.moe/v4";
const PER_PAGE = 20;

async function jikanFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
  return res.json();
}

function mapAnime(item: any): ExternalMedia {
  return {
    externalId: String(item.mal_id),
    title: item.title,
    imageUrl: item.images?.jpg?.image_url ?? null,
    description: item.synopsis ?? null,
  };
}

function mapManga(item: any): ExternalMedia {
  return {
    externalId: String(item.mal_id),
    title: item.title,
    imageUrl: item.images?.jpg?.image_url ?? null,
    description: item.synopsis ?? null,
  };
}

// ── Anime ──

export async function getAnime(page = 1, search?: string): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PER_PAGE),
  });

  if (search) {
    params.set("q", search);
    params.set("limit", String(PER_PAGE));
  } else {
    params.set("order_by", "popularity");
    params.set("sort", "asc");
  }

  const data = await jikanFetch(`${BASE_URL}/anime?${params}`);

  return {
    items: (data.data ?? []).map(mapAnime),
    currentPage: data.pagination?.current_page ?? page,
    totalPages: data.pagination?.last_visible_page ?? 1,
    totalItems: data.pagination?.items?.total ?? 0,
  };
}

export async function getSeasonalAnime(): Promise<ExternalMedia[]> {
  const data = await jikanFetch(`${BASE_URL}/seasons/now?limit=25`);
  return (data.data ?? []).map(mapAnime);
}

// ── Manga ──

export async function getManga(page = 1, search?: string): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PER_PAGE),
  });

  if (search) {
    params.set("q", search);
    params.set("limit", String(PER_PAGE));
  } else {
    params.set("order_by", "popularity");
    params.set("sort", "asc");
  }

  const data = await jikanFetch(`${BASE_URL}/manga?${params}`);

  return {
    items: (data.data ?? []).map(mapManga),
    currentPage: data.pagination?.current_page ?? page,
    totalPages: data.pagination?.last_visible_page ?? 1,
    totalItems: data.pagination?.items?.total ?? 0,
  };
}

export async function getPopularManga(): Promise<ExternalMedia[]> {
  const data = await jikanFetch(
    `${BASE_URL}/manga?order_by=popularity&sort=asc&limit=25&status=publishing`
  );
  return (data.data ?? []).map(mapManga);
}
