# GI Daily

GI Daily is a full-stack web app that ingests the latest gastroenterology papers from PubMed, summarizes the abstract, stores the results, and delivers a daily dashboard + email digest.

## Features

- Configurable journal + topic keywords list
- PubMed ingestion with ESearch + EFetch (2-day overlap)
- Structured summaries: bottom line, key findings, study type, why it matters, limitations
- Dashboard with filters (journal, study type, tags)
- Article detail view with PubMed + DOI links
- Bookmark toggle (single-user MVP)
- Daily email digest via Resend or SMTP
- Scheduled job via GitHub Actions cron

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite

## Quick Start

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Visit `http://localhost:3000`.

## Environment Variables

Create `.env` (or configure in your hosting platform):

```bash
DATABASE_URL="file:./dev.db"
CRON_SECRET="your-shared-secret"
APP_URL="https://your-deployment-url"
NEXT_PUBLIC_APP_URL="https://your-deployment-url"

# Email (choose one)
RESEND_API_KEY="your-resend-key"
EMAIL_FROM="GI Daily <digest@yourdomain.com>"
EMAIL_TO="you@yourdomain.com"

# SMTP fallback
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="username"
SMTP_PASS="password"

DIGEST_LIMIT="10"
```

## Ingestion

Run locally:

```bash
npm run ingest
```

Or call the internal endpoint:

```bash
curl -X POST "http://localhost:3000/api/ingest?token=CRON_SECRET"
```

## Daily Digest Cron

The GitHub Actions workflow calls `/api/cron` each day:

- Set `APP_URL` and `CRON_SECRET` as repository secrets.
- The job hits `POST $APP_URL/api/cron?token=$CRON_SECRET`.

## Deployment

1. Deploy to Vercel, Render, or similar.
2. Add environment variables listed above.
3. Run Prisma migration on the deployed environment.
4. Configure repository secrets for GitHub Actions cron.

## Journals + Keywords Config

Update `config/journals.ts` to add more journals or topic keywords.

## Notes

- Summaries are generated from the title + abstract only.
- This MVP assumes a single user (no authentication for bookmarks).
