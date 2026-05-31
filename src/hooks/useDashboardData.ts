import { useState, useEffect } from 'react';
import { api } from '../services/localApi';

const subjectFromPath = (filePath) => {
  if (!filePath) return 'General';
  const parts = filePath.split('/').filter(Boolean);
  const segments = parts.filter(p => !p.endsWith('.json'));
  if (segments.length === 0) return 'General';

  const subjectMap = {
    english: 'English', math: 'Math', analytical: 'Analytical Ability',
    accounting_1st: 'Accounting 1st Paper', accounting_2nd: 'Accounting 2nd Paper',
    finance_1st: 'Finance 1st Paper', finance_2nd: 'Finance 2nd Paper',
    production_1st: 'Production 1st Paper', production_2nd: 'Production 2nd Paper',
    english_2nd: 'English 2nd Paper',
    business_entrepreneurship: 'Business Entrepreneurship',
    social_2nd: 'Social Work 2nd Paper',
    economics_1st: 'Economics 1st Paper',
    economics_2nd: 'Economics 2nd Paper',
    logic_1st: 'Logic 1st Paper', logic_2nd: 'Logic 2nd Paper',
    management_1st: 'Management 1st Paper',
    management_2nd: 'Management 2nd Paper',
    marketing_1st: 'Marketing 1st Paper',
    marketing_2nd: 'Marketing 2nd Paper',
  };

  const examMap = {
    ssc: 'SSC', hsc: 'HSC', iba: 'IBA', bcs: 'BCS', class7: 'Class 7',
  };

  const examSlug = segments[0];
  const subjectSlug = segments.length >= 2 ? segments[1] : null;

  if (subjectSlug && subjectMap[subjectSlug]) return subjectMap[subjectSlug];
  if (examMap[examSlug]) return examMap[examSlug];

  return subjectSlug
    ? subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1).replace(/-/g, ' ')
    : (examMap[examSlug] || examSlug.charAt(0).toUpperCase() + examSlug.slice(1));
};

export function useDashboardData(userId) {
  const [statsData, setStatsData] = useState({
    totalPracticed: 0, accuracy: 0, totalTimeInMinutes: 0, correctOnes: 0, wrongOnes: 0,
  });
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUserStats(userId).then(({ data }) => { if (data) setStatsData(data); setLoading(false); });
  }, [userId]);

  useEffect(() => {
    api.getUserPracticeSessions(userId).then(({ data }) => setPracticeSessions(data || []));
  }, [userId]);

  useEffect(() => {
    api.getUserResponses(userId).then(({ data: responses }) => {
      if (responses?.length > 0) {
        const grouped = {};
        responses.forEach((r) => {
          const s = subjectFromPath(r.source_file);
          if (!grouped[s]) grouped[s] = { correct: 0, total: 0 };
          grouped[s].total++;
          if (r.is_correct) grouped[s].correct++;
        });
        setFocusAreas(
          Object.entries(grouped)
            .map(([label, { correct, total }]) => {
              const val = Math.round((correct / total) * 100);
              let status, color, tone;
              if (val >= 80) { status = 'Strong'; color = 'bg-accent'; tone = 'text-accent'; }
              else if (val >= 50) { status = 'Building'; color = 'bg-primary'; tone = 'text-primary'; }
              else { status = 'Needs work'; color = 'bg-reward'; tone = 'text-reward'; }
              return { label, status, val, color, tone };
            })
            .sort((a, b) => b.val - a.val)
            .slice(0, 4)
        );
      }
    });
  }, [userId]);

  return { statsData, practiceSessions, focusAreas, loading };
}
