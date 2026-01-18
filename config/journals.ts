export type JournalConfig = {
  name: string;
  keywords?: string[];
};

export const journalConfig: JournalConfig[] = [
  {
    name: 'Gastroenterology',
    keywords: ['IBD', 'colorectal cancer', 'liver', 'microbiome']
  },
  {
    name: 'Gut',
    keywords: ['endoscopy', 'pancreas', 'hepatitis']
  },
  {
    name: 'Clinical Gastroenterology and Hepatology',
    keywords: ['NAFLD', 'motility', 'celiac']
  }
];
