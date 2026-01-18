import { NextRequest, NextResponse } from 'next/server';
import { ingestLatestArticles } from '@/lib/ingest';

const authorize = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = request.headers.get('x-cron-secret');
  const queryToken = request.nextUrl.searchParams.get('token');
  return header === secret || queryToken === secret;
};

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await ingestLatestArticles();
  return NextResponse.json(result);
}
