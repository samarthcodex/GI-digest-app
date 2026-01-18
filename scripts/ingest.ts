import { ingestLatestArticles } from '@/lib/ingest';

const run = async () => {
  const result = await ingestLatestArticles();
  console.log(`Inserted ${result.inserted} articles.`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
