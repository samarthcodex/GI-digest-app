import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const articleId = Number(body.articleId);

  if (!articleId) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { articleId }
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { articleId } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: { articleId }
  });
  return NextResponse.json({ bookmarked: true });
}
