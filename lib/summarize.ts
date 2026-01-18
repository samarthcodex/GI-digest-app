import type { PubMedArticle } from './pubmed';

const studyTypeMatchers: Array<[string, RegExp]> = [
  ['Meta-analysis', /meta-analysis|systematic review/i],
  ['Randomized trial', /randomized|randomised|trial/i],
  ['Cohort study', /cohort|longitudinal/i],
  ['Case-control study', /case-control/i],
  ['Cross-sectional study', /cross-sectional/i],
  ['Guideline', /guideline|consensus|statement/i]
];

const splitSentences = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

const pickStudyType = (text: string) => {
  const match = studyTypeMatchers.find(([, regex]) => regex.test(text));
  return match ? match[0] : 'Observational study';
};

const buildWhyItMatters = (text: string) => {
  const reasons: string[] = [];
  if (/mortality|survival/i.test(text)) {
    reasons.push('Highlights impact on survival and outcomes.');
  }
  if (/cost|resource/i.test(text)) {
    reasons.push('Touches on resource utilization or costs.');
  }
  if (/quality of life/i.test(text)) {
    reasons.push('Addresses quality-of-life implications.');
  }
  if (reasons.length === 0) {
    reasons.push('Clarifies clinical implications for GI practice.');
  }
  return reasons;
};

const buildLimitations = (text: string) => {
  const limitations: string[] = [];
  if (/single center|single-centre/i.test(text)) {
    limitations.push('Single-center setting may limit generalizability.');
  }
  if (/retrospective/i.test(text)) {
    limitations.push('Retrospective design may introduce bias.');
  }
  if (/small sample|limited sample/i.test(text)) {
    limitations.push('Sample size appears limited.');
  }
  if (limitations.length === 0) {
    limitations.push('Limitations not explicitly stated in abstract.');
  }
  return limitations;
};

export const summarizeArticle = (article: PubMedArticle) => {
  const combinedText = `${article.title}. ${article.abstractText}`.trim();
  const sentences = splitSentences(article.abstractText || article.title);
  const bottomLine = sentences[0] ?? article.title;
  const keyFindings = sentences.slice(0, 3);

  return {
    bottomLine,
    keyFindings,
    studyType: pickStudyType(combinedText),
    whyItMatters: buildWhyItMatters(combinedText),
    limitations: buildLimitations(combinedText)
  };
};
