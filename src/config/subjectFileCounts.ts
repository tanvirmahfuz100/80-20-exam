import { subjectNameToId } from '../pages/SubjectSelection';

const RAW_COUNTS: Record<string, Record<string, number>> = {
  ssc: {
    accounting: 113,
    agriculture: 69,
    bangla: 139,
    business_entrepreneurship: 88,
    english: 7,
    finance: 96,
    general_science: 98,
    ict: 100,
    islam: 91,
    math: 128,
  },
  hsc: {
    accounting_1st: 151,
    accounting_2nd: 11,
    bangla_1st: 159,
    bangla_2nd: 149,
    economics_1st: 10,
    economics_2nd: 10,
    english: 1,
    english_2nd: 2,
    finance_1st: 9,
    finance_2nd: 13,
    logic_1st: 8,
    logic_2nd: 8,
    management_1st: 136,
    management_2nd: 124,
    marketing_1st: 111,
    marketing_2nd: 116,
    production_1st: 15,
    production_2nd: 11,
    social_1st: 9,
    social_2nd: 9,
  },
  iba: {
    analytical: 5,
    english: 26,
    math: 27,
  },
  class7: {
    english: 28,
  },
};

export function getSubjectTotalFiles(exam: string, subjectSlug: string): number {
  const examCounts = RAW_COUNTS[exam.toLowerCase()];
  if (!examCounts) return 0;
  let total = examCounts[subjectSlug] ?? 0;
  total += examCounts[`${subjectSlug}_1st`] ?? 0;
  total += examCounts[`${subjectSlug}_2nd`] ?? 0;
  return total;
}

export function getSubjectTotalFilesByName(exam: string, subjectName: string): number {
  const slug = subjectNameToId[subjectName];
  if (!slug) return 0;
  return getSubjectTotalFiles(exam, slug);
}
