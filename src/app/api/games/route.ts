import { prisma } from "@/lib/prisma";
import { getGames, isRawgConfigured } from "@/lib/rawg";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const listOnly = req.nextUrl.searchParams.get("list");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");

  if (listOnly) {
    const items = await prisma.media.findMany({
      where: { type: "GAME" },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(items);
  }

  if (!isRawgConfigured()) {
    return NextResponse.json({
      items: [],
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      myIds: [],
      error: "RAWG_API_KEY non configurée. Crée un compte gratuit sur https://rawg.io/apidocs et ajoute ta clé dans .env",
    });
  }

  const [paginated, myList] = await Promise.all([
    getGames(page, search),
    prisma.media.findMany({
      where: { type: "GAME" },
      select: { externalId: true },
    }),
  ]);

  const myIds = new Set(myList.map((m) => m.externalId));

  return NextResponse.json({
    ...paginated,
    myIds: Array.from(myIds),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.media.create({
    data: {
      externalId: body.externalId,
      type: "GAME",
      title: body.title,
      imageUrl: body.imageUrl,
      description: body.description,
      status: body.status ?? "PLANNED",
      rating: body.rating ?? null,
      comment: body.comment ?? null,
      isRewatch: body.isRewatch ?? false,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.media.update({
    where: { id: body.id },
    data: {
      status: body.status,
      rating: body.rating,
      comment: body.comment,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.media.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
