import { XMLParser } from 'fast-xml-parser';
import { journalConfig } from '@/config/journals';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

const formatDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export type PubMedArticle = {
  pmid: string;
  title: string;
  abstractText: string;
  journal: string;
  publishedDate: Date;
  authors: string;
  doi?: string;
  tags: string[];
};

const buildQuery = (journal: string, keywords?: string[]) => {
  const journalQuery = `"${journal}"[ta]`;
  if (!keywords || keywords.length === 0) {
    return journalQuery;
  }
  const keywordQuery = keywords.map((keyword) => `"${keyword}"[tiab]`).join(' OR ');
  return `(${journalQuery}) AND (${keywordQuery})`;
};

export const fetchRecentPmids = async () => {
  const end = new Date();
  const start = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const mindate = formatDate(start);
  const maxdate = formatDate(end);

  const pmidSet = new Set<string>();

  for (const journal of journalConfig) {
    const query = buildQuery(journal.name, journal.keywords);
    const url = `${BASE_URL}/esearch.fcgi?db=pubmed&retmode=json&retmax=200&datetype=pdat&mindate=${mindate}&maxdate=${maxdate}&term=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`PubMed ESearch failed for ${journal.name}`);
    }
    const data = await response.json();
    const ids: string[] = data.esearchresult?.idlist ?? [];
    ids.forEach((id) => pmidSet.add(id));
  }

  return Array.from(pmidSet);
};

export const fetchArticlesByPmids = async (pmids: string[]) => {
  if (pmids.length === 0) return [];

  const url = `${BASE_URL}/efetch.fcgi?db=pubmed&retmode=xml&id=${pmids.join(',')}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('PubMed EFetch failed');
  }
  const xml = await response.text();
  const data = parser.parse(xml);
  const articles = toArray(data?.PubmedArticleSet?.PubmedArticle);

  return articles.map((article) => {
    const medline = article?.MedlineCitation ?? {};
    const articleData = medline?.Article ?? {};
    const pubDate = articleData?.Journal?.JournalIssue?.PubDate ?? {};

    const year = pubDate?.Year ?? new Date().getUTCFullYear();
    const month = pubDate?.Month ?? '01';
    const day = pubDate?.Day ?? '01';
    const dateValue = new Date(`${year}-${month}-${day}`);

    const authorList = toArray(articleData?.AuthorList?.Author)
      .map((author) => {
        const last = author?.LastName;
        const first = author?.ForeName;
        if (!last) return null;
        return first ? `${last} ${first}` : last;
      })
      .filter(Boolean)
      .join(', ');

    const abstractText = toArray(articleData?.Abstract?.AbstractText)
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        return entry['#text'] ?? '';
      })
      .join(' ')
      .trim();

    const idList = toArray(article?.PubmedData?.ArticleIdList?.ArticleId);
    const doi = idList.find((id) => id?.IdType === 'doi')?.['#text'];

    const journalName = articleData?.Journal?.Title ?? 'Unknown Journal';
    const title = articleData?.ArticleTitle ?? 'Untitled';

    const tags = journalConfig.find((config) => config.name === journalName)?.keywords ?? [];

    return {
      pmid: String(medline?.PMID ?? ''),
      title: typeof title === 'string' ? title : title['#text'] ?? 'Untitled',
      abstractText,
      journal: journalName,
      publishedDate: isNaN(dateValue.getTime()) ? new Date() : dateValue,
      authors: authorList,
      doi,
      tags
    } satisfies PubMedArticle;
  });
};
