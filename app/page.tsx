import Link from 'next/link';
import BookmarkButton from '@/app/components/BookmarkButton';
import { prisma } from '@/lib/db';

const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

type SearchParams = {
  journal?: string;
  study_type?: string;
  tag?: string;
};

export default async function Home({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const journal = searchParams.journal ?? '';
  const studyType = searchParams.study_type ?? '';
  const tag = searchParams.tag ?? '';

  const where = {
    publishedDate: {
      gte: startOfToday()
    },
    ...(journal ? { journal } : {}),
    ...(studyType
      ? {
          summary: {
            is: {
              studyType
            }
          }
        }
      : {}),
    ...(tag
      ? {
          tags: {
            array_contains: tag
          }
        }
      : {})
  };

  const [articles, journalOptions, studyTypeOptions] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        summary: true,
        bookmarks: true
      },
      orderBy: {
        publishedDate: 'desc'
      }
    }),
    prisma.article.findMany({
      distinct: ['journal'],
      select: { journal: true },
      orderBy: { journal: 'asc' }
    }),
    prisma.summary.findMany({
      distinct: ['studyType'],
      select: { studyType: true },
      orderBy: { studyType: 'asc' }
    })
  ]);

  const tagSet = new Set<string>();
  for (const article of articles) {
    const tags = (article.tags as string[] | null) ?? [];
    tags.forEach((value) => tagSet.add(value));
  }

  const tagOptions = Array.from(tagSet).sort();

  return (
    <div className="space-y-8">
      <section className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Today&apos;s Papers</h2>
          <p className="text-sm text-slate-600">
            Automated summaries of the latest gastroenterology papers.
          </p>
        </div>
        <form className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm text-slate-600">
            Journal
            <select
              name="journal"
              defaultValue={journal}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All journals</option>
              {journalOptions.map((option) => (
                <option key={option.journal} value={option.journal}>
                  {option.journal}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            Study type
            <select
              name="study_type"
              defaultValue={studyType}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All study types</option>
              {studyTypeOptions.map((option) => (
                <option key={option.studyType} value={option.studyType}>
                  {option.studyType}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            Tag
            <select
              name="tag"
              defaultValue={tag}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All tags</option>
              {tagOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="col-span-full justify-self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Apply filters
          </button>
        </form>
      </section>

      <section className="space-y-4">
        {articles.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-600">No articles ingested yet for today.</p>
          </div>
        ) : (
          articles.map((article) => (
            <article key={article.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/articles/${article.id}`} className="text-lg font-semibold text-slate-900">
                    {article.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {article.journal} · {article.publishedDate.toDateString()}
                  </p>
                </div>
                <BookmarkButton
                  articleId={article.id}
                  initialBookmarked={article.bookmarks.length > 0}
                />
              </div>
              {article.summary && (
                <p className="text-sm text-slate-700">{article.summary.bottomLine}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {article.summary && <span className="badge">{article.summary.studyType}</span>}
                {(article.tags as string[] | null)?.map((value) => (
                  <span key={value} className="badge">{value}</span>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
