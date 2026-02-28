import type { ExternalMedia, PaginatedResponse } from "@/types";

const BASE_URL = "https://api.rawg.io/api";
const PER_PAGE = 20;

function getApiKey() {
  const key = process.env.RAWG_API_KEY;
  if (!key || key === "your_rawg_api_key_here") {
    return null;
  }
  return key;
}

export function isRawgConfigured(): boolean {
  return getApiKey() !== null;
}

export async function getGames(page = 1, search?: string): Promise<PaginatedResponse> {
  const key = getApiKey();
  if (!key) {
    return {
      items: [],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
    };
  }

  const params = new URLSearchParams({
    key,
    page: String(page),
    page_size: String(PER_PAGE),
  });

  if (search) {
    params.set("search", search);
  } else {
    params.set("ordering", "-rating");
  }

  const res = await fetch(`${BASE_URL}/games?${params}`);
  if (!res.ok) throw new Error(`RAWG API error: ${res.status}`);
  const data = await res.json();

  const totalItems = data.count ?? 0;
  const totalPages = Math.ceil(totalItems / PER_PAGE);

  return {
    items: (data.results ?? []).map((item: any) => ({
      externalId: String(item.id),
      title: item.name,
      imageUrl: item.background_image ?? null,
      description: item.description_raw?.slice(0, 300) ?? null,
    })),
    currentPage: page,
    totalPages,
    totalItems,
  };
}

export async function getMonthlyGames(): Promise<ExternalMedia[]> {
  const key = getApiKey();
  if (!key) return [];

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-${lastDay}`;

  const res = await fetch(
    `${BASE_URL}/games?key=${key}&dates=${start},${end}&ordering=-rating&page_size=25`
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.results ?? []).map((item: any) => ({
    externalId: String(item.id),
    title: item.name,
    imageUrl: item.background_image ?? null,
    description: item.description_raw?.slice(0, 300) ?? null,
  }));
}
