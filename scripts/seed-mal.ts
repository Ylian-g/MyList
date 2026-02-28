import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";

const DATABASE_URL = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// MAL status → our status
const STATUS_MAP: Record<string, string> = {
  "Watching": "IN_PROGRESS",
  "Completed": "COMPLETED",
  "On-Hold": "PAUSED",
  "Dropped": "DROPPED",
  "Plan to Watch": "PLANNED",
};

// Simple XML parser for MAL export
function parseMALExport(xml: string) {
  const entries: any[] = [];
  const animeBlocks = xml.split("<anime>").slice(1);

  for (const block of animeBlocks) {
    const get = (tag: string) => {
      const match = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`));
      return match?.[1]?.trim() ?? "";
    };

    entries.push({
      malId: get("series_animedb_id"),
      title: get("series_title"),
      score: parseInt(get("my_score")) || 0,
      status: get("my_status"),
      comments: get("my_comments"),
      timesWatched: parseInt(get("my_times_watched")) || 0,
    });
  }

  return entries;
}

// Fetch image from Jikan (rate limited: 3 req/sec)
async function getAnimeImage(malId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.images?.jpg?.image_url ?? null;
  } catch {
    return null;
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const xmlPath = process.argv[2];
  if (!xmlPath) {
    console.error("Usage: bun scripts/seed-mal.ts <path-to-mal-export.xml>");
    process.exit(1);
  }

  const xml = readFileSync(xmlPath, "utf-8");
  const entries = parseMALExport(xml);
  console.log(`Parsed ${entries.length} anime from MAL export`);

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const status = STATUS_MAP[entry.status] ?? "PLANNED";

    // Check if already exists
    const existing = await prisma.media.findFirst({
      where: { externalId: entry.malId, type: "ANIME" },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Fetch image (rate limit: wait 350ms between requests)
    let imageUrl: string | null = null;
    if (i > 0 && i % 3 === 0) {
      await sleep(1100); // Jikan rate limit: 3 req/sec
    }
    imageUrl = await getAnimeImage(entry.malId);
    await sleep(350);

    await prisma.media.create({
      data: {
        externalId: entry.malId,
        type: "ANIME",
        title: entry.title,
        imageUrl,
        status: status as any,
        rating: entry.score > 0 ? entry.score : null,
        comment: entry.comments || null,
        isRewatch: entry.timesWatched > 0,
      },
    });

    inserted++;
    if (inserted % 10 === 0) {
      console.log(`  ${inserted}/${entries.length - skipped} insérés (${skipped} déjà existants)...`);
    }
  }

  console.log(`\nTerminé ! ${inserted} anime insérés, ${skipped} ignorés (déjà en DB)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
