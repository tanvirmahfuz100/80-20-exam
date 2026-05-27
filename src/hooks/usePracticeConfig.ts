import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';

export function usePracticeConfig() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryFilter = (searchParams.get('exam') || searchParams.get('category') || '').toLowerCase();
  const subjectFilter = searchParams.get('subjectId') || '';

  const [data, setData] = useState({ exams: [] });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isTimed, setIsTimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterQuestionCounts, setChapterQuestionCounts] = useState({});
  const [chapterCompletedCounts, setChapterCompletedCounts] = useState({});

  const version = profile?.question_version || 'bangla';

  const getChapterFile = useCallback((chapter) => {
    if (!chapter) return null;
    if (version === 'english') return chapter.file_en || chapter.file || chapter.file_bn || null;
    return chapter.file_bn || chapter.file || chapter.file_en || null;
  }, [version]);

  const getSubjectProgress = useCallback((subject) => {
    let completed = 0, total = 0;
    (subject.topics || []).forEach(topic => {
      (topic.chapters || []).forEach(chapter => {
        const file = getChapterFile(chapter);
        if (file) {
          completed += chapterCompletedCounts[file] || 0;
          total += chapterQuestionCounts[file] || 0;
        }
      });
    });
    return { completed, total };
  }, [chapterCompletedCounts, chapterQuestionCounts, getChapterFile]);

  const getExamProgress = useCallback((exam) => {
    let completed = 0, total = 0;
    (exam.subjects || []).forEach(subject => {
      const p = getSubjectProgress(subject);
      completed += p.completed;
      total += p.total;
    });
    return { completed, total };
  }, [getSubjectProgress]);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const examCatalog = [
      { id: 'ssc', label: 'SSC', note: 'NCTB English 1st and 2nd Paper' },
      { id: 'hsc', label: 'HSC', note: 'NCTB English 1st and 2nd Paper' },
      { id: 'iba', label: 'IBA', note: 'Admission English, Math, Analytical' },
      { id: 'bcs', label: 'BCS', note: 'Competitive exam practice' },
      { id: 'class7', label: 'Class 7', note: 'English Grammar' }
    ];

    Promise.all(examCatalog.map(exam =>
      fetch(`${base}${exam.id}/index.json`)
        .then(r => r.ok ? r.json().then(j => ({ exam, json: j })) : null)
        .catch(() => null)
    ))
      .then(results => {
        const exams = results.filter(Boolean).map(({ exam, json }) => {
          let subjects;
          if (exam.id === 'bcs' && Array.isArray(json)) {
            subjects = [{
              id: 'bcs_all',
              name: 'BCS Questions',
              name_bn: 'বিসিএস প্রশ্ন',
              name_en: 'BCS Questions',
              exam_category: 'BCS',
              topics: [{
                id: 'bcs_exams',
                name: 'All BCS Exams',
                name_bn: 'সকল বিসিএস',
                name_en: 'All BCS Exams',
                chapters: json.map(item => ({
                  id: item.id,
                  name: item.name,
                  file_bn: `/bcs/${item.id}.json`,
                  file_en: `/bcs/${item.id}.json`,
                }))
              }]
            }];
          } else {
            subjects = (Array.isArray(json) ? json : json.subjects || []).map(sub => ({ ...sub, exam_category: exam.id.toUpperCase() }));
          }
          return { ...exam, active: true, subjects };
        });

        const inactiveExams = examCatalog
          .filter(exam => !exams.some(e => e.id === exam.id))
          .map(exam => ({ ...exam, active: false, subjects: [] }));

        const allExams = [...exams, ...inactiveExams];
        setData({ exams: allExams });

        const requested = allExams.find(exam => exam.id === categoryFilter && exam.active);
        setSelectedExam(requested || null);
        if (requested && subjectFilter) {
          const matched = requested.subjects.find(sub => sub.id === subjectFilter);
          setSelectedSubject(matched || null);
        } else {
          setSelectedSubject(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [categoryFilter, subjectFilter]);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';

    const countChapterQuestions = async (chapterFile) => {
      if (!chapterFile) return 0;
      try {
        const path = chapterFile.startsWith('/') ? `${base}${chapterFile.slice(1)}` : chapterFile;
        const res = await fetch(path);
        if (!res.ok) return 0;
        const payload = await res.json();
        if (payload?._type === 'bangla_written' && Array.isArray(payload.sections)) {
          return payload.sections.reduce((total, s) =>
            total + (Array.isArray(s.questions) ? s.questions.length : 0), 0);
        }
        if (Array.isArray(payload?.chapters)) {
          return payload.chapters.reduce((total, ch) => {
            const c = ch.content || {};
            if (Array.isArray(c.questions)) return total + c.questions.length;
            if (Array.isArray(c.mcqQuestions)) return total + c.mcqQuestions.length;
            if (Array.isArray(c.valid_sentences)) return total + c.valid_sentences.length;
            if (Array.isArray(c.sentences)) return total + c.sentences.length;
            if (c.gapFill?.blanks) return total + c.gapFill.blanks.length + (c.vocabQuestions?.length || 0);
            if (Array.isArray(c.vocabQuestions)) return total + c.vocabQuestions.length;
            return total;
          }, 0);
        }
        const sourceQuestions = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.questions)
            ? payload.questions
            : Array.isArray(payload?.passages)
              ? payload.passages
              : [];
        if (Array.isArray(sourceQuestions) && sourceQuestions.length > 0 && Array.isArray(sourceQuestions[0].items)) {
          return sourceQuestions.reduce((total, set) => total + (set.items?.length || 0), 0);
        }
        return sourceQuestions.reduce((total, question) => {
          if (Array.isArray(question.blanks) && question.blanks.length > 0) {
            return total + question.blanks.length;
          }
          return total + 1;
        }, 0);
      } catch {
        return 0;
      }
    };

    const hydrateChapterCounts = async () => {
      const chapterEntries = (data.exams || [])
        .flatMap((exam) => exam.subjects || [])
        .flatMap((subject) => subject.topics || [])
        .flatMap((topic) => topic.chapters || [])
        .map((chapter) => ({ chapter, file: getChapterFile(chapter) }))
        .filter((entry) => Boolean(entry.file));

      if (chapterEntries.length === 0) {
        setChapterQuestionCounts({});
        return;
      }

      const pairs = await Promise.all(
        chapterEntries.map(async ({ file }) => [file, await countChapterQuestions(file)])
      );

      setChapterQuestionCounts(Object.fromEntries(pairs));
    };

    hydrateChapterCounts();
  }, [data, version, getChapterFile]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: responses } = await api.getUserResponses(user.id);
      if (!responses) return;
      const seen = new Set();
      const completed = {};
      responses.forEach(r => {
        const file = r.source_file;
        const qid = r.question_id;
        if (!file || !qid) return;
        const key = `${file}_${qid}`;
        if (seen.has(key)) return;
        seen.add(key);
        completed[file] = (completed[file] || 0) + 1;
      });
      setChapterCompletedCounts(completed);
    })();
  }, [user?.id]);

  const step = selectedExam && selectedSubject ? 2 : selectedExam ? 1 : 0;

  const goToStep = (s) => {
    if (s === 0) { setSelectedSubject(null); setSelectedExam(null); }
    else if (s === 1) { setSelectedSubject(null); }
  };

  const handleStart = (chapter, displayName) => {
    const file = getChapterFile(chapter);
    const isCq = file && file.includes('_cq.');
    if (chapter._type === 'model_test' || isCq) {
      navigate(`/quiz/${chapter.id}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(displayName || chapter.name)}&chapterId=${chapter.id}`);
    } else if (chapter._type === 'creative') {
      navigate(`/creative-view?file=${encodeURIComponent(file)}&title=${encodeURIComponent(displayName || chapter.name)}`);
    } else if (chapter._type === 'bangla_written') {
      navigate(`/bangla-written-view?file=${encodeURIComponent(file)}&title=${encodeURIComponent(displayName || chapter.name)}`);
    } else {
      navigate(`/levels?file=${encodeURIComponent(file)}&title=${encodeURIComponent(displayName || chapter.name)}&chapterId=${chapter.id}`);
    }
  };

  return {
    data, selectedExam, selectedSubject, isTimed, loading, error,
    chapterQuestionCounts, chapterCompletedCounts,
    step, version,
    getChapterFile, getSubjectProgress, getExamProgress,
    setSelectedExam, setSelectedSubject, setIsTimed,
    goToStep, handleStart,
  };
}
