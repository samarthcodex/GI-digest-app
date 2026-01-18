import { NextRequest, NextResponse } from 'next/server';
import { ingestLatestArticles } from '@/lib/ingest';
import { prisma } from '@/lib/db';
import { sendDigestEmail } from '@/lib/email';

const authorize = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get('x-cron-secret');
  const queryToken = request.nextUrl.searchParams.get('token');
  return header === secret || queryToken === secret;
};

const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ingestResult = await ingestLatestArticles();

  const topLimit = Number(process.env.DIGEST_LIMIT ?? 10);
  const articles = await prisma.article.findMany({
    where: {
      publishedDate: {
        gte: startOfToday()
      },
      summary: {
        isNot: null
      }
    },
    include: {
      summary: true
    },
    take: topLimit,
    orderBy: {
      publishedDate: 'desc'
    }
  });

  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM;

  if (to && from && articles.length > 0) {
    const baseUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await sendDigestEmail({
      to,
      from,
      subject: 'GI Daily Digest',
      items: articles.map((article) => ({
        title: article.title,
        bottomLine: article.summary?.bottomLine ?? '',
        url: `${baseUrl}/articles/${article.id}`
      }))
    });
  }

  return NextResponse.json({
    ingest: ingestResult,
    emailed: Boolean(to && from && articles.length > 0),
    count: articles.length
  });
}
