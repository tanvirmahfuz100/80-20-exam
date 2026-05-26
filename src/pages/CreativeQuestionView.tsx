import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const CreativeQuestionView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const file = searchParams.get('file');
  const title = searchParams.get('title') || 'Creative Questions';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  useEffect(() => {
    if (!file) {
      setError('No question file specified');
      setLoading(false);
      return;
    }
    const baseUrl = import.meta.env.BASE_URL || '/';
    const fileUrl = file.startsWith('/') ? `${baseUrl}${file.slice(1)}` : file;
    fetch(fileUrl)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (json._type !== 'creative_questions') throw new Error('Invalid question format');
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [file]);

  const toggleAnswer = (id) => {
    setExpandedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const newVal = !showAllAnswers;
    setShowAllAnswers(newVal);
    if (data?.questions) {
      const all = {};
      data.questions.forEach(q => { all[q.id] = newVal; });
      setExpandedAnswers(all);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/practice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg font-bold">Failed to load</p>
          <p className="text-text-muted text-sm">{error}</p>
          <button onClick={goBack} className="px-6 py-2 bg-surface-alt hover:bg-surface-hover rounded-xl text-sm font-medium text-text-muted transition-colors">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!data?.questions?.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 text-text-dim mx-auto" />
          <p className="text-text-muted text-lg font-medium">No creative questions available</p>
          <button onClick={goBack} className="px-6 py-2 bg-surface-alt hover:bg-surface-hover rounded-xl text-sm font-medium text-text-muted transition-colors">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">{title}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
              {data.questions.length} questions
            </p>
          </div>
        </div>
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt hover:bg-surface-hover rounded-xl text-xs font-medium text-text-muted transition-colors"
        >
          {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showAllAnswers ? 'Hide All Answers' : 'Show All Answers'}
        </button>
      </div>

      {/* Question List */}
      <div className="space-y-6">
        {data.questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface border rounded-2xl overflow-hidden"
          >
            {/* Question Header */}
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-text-dim">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black">
                  {q.id}
                </span>
                <span className="uppercase tracking-wider">Question {q.id}</span>
                {q.source && (
                  <>
                    <span className="text-text-dim">•</span>
                    <span className="text-text-dim">{q.source}</span>
                  </>
                )}
              </div>

              {/* Stimulus */}
              {q.stimulus && (
                <div className="p-3 md:p-4 bg-surface-alt border border rounded-xl text-sm text-text leading-relaxed">
                  {q.stimulus}
                </div>
              )}

              {/* Sub-questions */}
              <div className="space-y-2">
                {q.questions.map(sq => (
                  <div key={sq.label} className="flex items-start gap-2 text-sm">
                    <span className="font-bold text-primary shrink-0 w-5 text-right">
                      {sq.label}.
                    </span>
                    <span className="text-text">{sq.text}</span>
                    {sq.mark && (
                      <span className="text-[10px] font-black text-text-dim shrink-0 mt-0.5">
                        {sq.mark}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Toggle */}
            {Object.keys(q.answer).length > 0 && (
              <div className="border-t">
                <button
                  onClick={() => toggleAnswer(q.id)}
                  className="w-full flex items-center justify-between px-4 md:px-6 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-text-dim hover:text-text-muted transition-colors"
                >
                  <span>Answers</span>
                  {expandedAnswers[q.id] ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {expandedAnswers[q.id] && (
                  <div className="px-4 md:px-6 pb-4 space-y-2">
                    {q.questions.map(sq => {
                      const ans = q.answer[sq.label];
                      if (!ans) return null;
                      return (
                        <div key={sq.label} className="p-2.5 bg-primary/[0.03] border border-primary/[0.08] rounded-lg">
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-bold text-emerald-400 shrink-0 w-5 text-right">
                              {sq.label}.
                            </span>
                            <span className="text-text-muted text-xs leading-relaxed">{ans}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CreativeQuestionView;
