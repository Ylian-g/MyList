import { prisma } from "@/lib/prisma";
import { getSeasonalAnime, getPopularManga } from "@/lib/jikan";
import { getMonthlyGames } from "@/lib/rawg";
import { NextResponse } from "next/server";
import type { MediaType } from "@prisma/client";

function getCurrentMonth() {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

export async function POST() {
  const month = getCurrentMonth();

  try {
    const [anime, manga, games] = await Promise.all([
      getSeasonalAnime().catch(() => []),
      getPopularManga().catch(() => []),
      getMonthlyGames().catch(() => []),
    ]);

    const toUpsert = [
      ...anime.map((a) => ({ ...a, type: "ANIME" as MediaType })),
      ...manga.map((m) => ({ ...m, type: "MANGA" as MediaType })),
      ...games.map((g) => ({ ...g, type: "GAME" as MediaType })),
    ];

    let count = 0;
    for (const item of toUpsert) {
      await prisma.monthlyRecommendation.upsert({
        where: {
          externalId_type_month: {
            externalId: item.externalId,
            type: item.type,
            month,
          },
        },
        update: {},
        create: {
          externalId: item.externalId,
          type: item.type,
          title: item.title,
          imageUrl: item.imageUrl,
          description: item.description,
          month,
          isNew: true,
        },
      });
      count++;
    }

    return NextResponse.json({ ok: true, month, count });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const month = getCurrentMonth();

  const [recommendations, myList] = await Promise.all([
    prisma.monthlyRecommendation.findMany({
      where: { month },
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.findMany({
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const myIds = new Set(myList.map((m) => `${m.externalId}-${m.type}`));

  // Nouveautés : recommandations pas encore dans ma liste
  const newRecs = recommendations.filter(
    (r) => !myIds.has(`${r.externalId}-${r.type}`)
  );

  // Déjà vus : éléments de ma liste qui matchent les recommandations du mois
  const recIds = new Set(recommendations.map((r) => `${r.externalId}-${r.type}`));
  const alreadySeen = myList.filter(
    (m) => m.externalId && recIds.has(`${m.externalId}-${m.type}`)
  );

  return NextResponse.json({
    month,
    anime: newRecs.filter((r) => r.type === "ANIME"),
    manga: newRecs.filter((r) => r.type === "MANGA"),
    games: newRecs.filter((r) => r.type === "GAME"),
    seen: {
      anime: alreadySeen.filter((m) => m.type === "ANIME"),
      manga: alreadySeen.filter((m) => m.type === "MANGA"),
      games: alreadySeen.filter((m) => m.type === "GAME"),
    },
  });
}
