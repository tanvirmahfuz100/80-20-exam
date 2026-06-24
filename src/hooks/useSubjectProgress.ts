import { useState, useEffect, useMemo } from 'react';
import { readStorage } from '../utils/storage';
import { subjectNameToId } from '../pages/SubjectSelection';
import { getSubjectTotalFilesByName } from '../config/subjectFileCounts';

const RESPONSES_KEY = 'exam_user_responses';

const idToSubjectName: Record<string, string> = {};
for (const [name, id] of Object.entries(subjectNameToId)) {
  idToSubjectName[id] = name;
}

function slugToName(slug: string): string | undefined {
  const name = idToSubjectName[slug];
  if (name) return name;
  const parent = slug.replace(/_(1st|2nd)$/, '');
  return idToSubjectName[parent];
}

export function useSubjectProgress(exam: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1);
    window.addEventListener('responses-changed', handler);
    return () => window.removeEventListener('responses-changed', handler);
  }, []);

  return useMemo(() => {
    const responses: any[] = readStorage(RESPONSES_KEY, []);
    const examSlug = exam.toLowerCase();
    const subjectFiles: Record<string, Set<string>> = {};

    for (const r of responses) {
      const path = r.source_file || '';
      if (!path) continue;
      const clean = path.replace(/^\/+/, '');
      const parts = clean.split('/');
      if (parts.length < 2) continue;
      if (parts[0] !== examSlug) continue;

      const slug = parts[1];
      const bnName = slugToName(slug);
      if (!bnName) continue;

      if (!subjectFiles[bnName]) subjectFiles[bnName] = new Set();
      subjectFiles[bnName].add(path);
    }

    const result: Record<string, number> = {};
    for (const [bnName, answeredSet] of Object.entries(subjectFiles)) {
      const total = getSubjectTotalFilesByName(exam, bnName);
      result[bnName] = total > 0 ? Math.min(100, Math.round((answeredSet.size / total) * 100)) : 0;
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, refreshKey]);
}
