import Link from 'next/link';
import { prisma } from '@/lib/db';
import BookmarkButton from '@/app/components/BookmarkButton';

const buildPubmedUrl = (pmid: string) => `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

export default async function ArticlePage({
  params
}: {
  params: { id: string };
}) {
  const article = await prisma.article.findUnique({
    where: { id: Number(params.id) },
    include: {
      summary: true,
      bookmarks: true
    }
  });

  if (!article) {
    return (
      <div className="card">
        <p className="text-sm text-slate-600">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{article.journal}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{article.title}</h2>
            <p className="text-sm text-slate-500">{article.publishedDate.toDateString()}</p>
          </div>
          <BookmarkButton
            articleId={article.id}
            initialBookmarked={article.bookmarks.length > 0}
          />
        </div>
        <p className="text-sm text-slate-600">{article.authors}</p>
        {article.abstract && <p className="text-sm text-slate-700">{article.abstract}</p>}
        <div className="flex flex-wrap gap-2">
          {article.summary && <span className="badge">{article.summary.studyType}</span>}
          {(article.tags as string[] | null)?.map((value) => (
            <span key={value} className="badge">{value}</span>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">Structured Summary</h3>
        {article.summary ? (
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Bottom line</p>
              <p>{article.summary.bottomLine}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Key findings</p>
              <ul className="list-disc space-y-1 pl-5">
                {(article.summary.keyFindings as string[]).map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Why it matters</p>
              <ul className="list-disc space-y-1 pl-5">
                {(article.summary.whyItMatters as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Limitations</p>
              <ul className="list-disc space-y-1 pl-5">
                {(article.summary.limitations as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Summary pending.</p>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold">Links</h3>
        <div className="mt-2 flex flex-col gap-2 text-sm">
          <Link className="text-slate-700 hover:text-slate-900" href={buildPubmedUrl(article.pmid)}>
            PubMed
          </Link>
          {article.doi && (
            <Link className="text-slate-700 hover:text-slate-900" href={`https://doi.org/${article.doi}`}>
              DOI: {article.doi}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
