import { prisma } from './db';
import { fetchArticlesByPmids, fetchRecentPmids } from './pubmed';
import { summarizeArticle } from './summarize';

export const ingestLatestArticles = async () => {
  const pmids = await fetchRecentPmids();
  const articles = await fetchArticlesByPmids(pmids);

  const created = [] as number[];

  for (const article of articles) {
    if (!article.pmid) continue;

    const existing = await prisma.article.findFirst({
      where: {
        OR: [
          { pmid: article.pmid },
          ...(article.doi ? [{ doi: article.doi }] : [])
        ]
      }
    });

    if (existing) continue;

    const summary = summarizeArticle(article);

    const saved = await prisma.article.create({
      data: {
        pmid: article.pmid,
        doi: article.doi,
        title: article.title,
        abstract: article.abstractText,
        journal: article.journal,
        publishedDate: article.publishedDate,
        authors: article.authors,
        tags: article.tags,
        summary: {
          create: {
            bottomLine: summary.bottomLine,
            keyFindings: summary.keyFindings,
            studyType: summary.studyType,
            whyItMatters: summary.whyItMatters,
            limitations: summary.limitations
          }
        }
      }
    });

    created.push(saved.id);
  }

  return { inserted: created.length };
};
