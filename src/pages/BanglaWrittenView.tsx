import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  name?: string;
  questions: { id: number; text: string }[];
}

interface BanglaWrittenData {
  _type: string;
  examName: string;
  totalQuestions: number;
  sections: Section[];
}

type LineType = 'instruction' | 'sub_question' | 'option_item' | 'body';

interface ParsedLine {
  type: LineType;
  text: string;
}

function parseQuestionLines(text: string): ParsedLine[] {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length <= 1) return [{ type: 'body', text }];

  return lines.map(line => {
    const trimmed = line.trim();
    if (/^\d+\.\d+\.?\s/.test(trimmed)) return { type: 'sub_question', text: trimmed };
    if (/^[ক-হ]/u.test(trimmed) && /^[ক-হ][\).]/.test(trimmed)) return { type: 'option_item', text: trimmed };
    if (/^[iIvVxX]+\)/.test(trimmed) || /^[a-z]\)/.test(trimmed)) return { type: 'option_item', text: trimmed };
    if (/^(নিচের|যেকোনো|উদাহরণসহ|নির্দেশ|অনুচ্ছেদ)/.test(trimmed)) return { type: 'instruction', text: trimmed };
    return { type: 'body', text: trimmed };
  });
}

const LineRenderer = ({ line }: { line: ParsedLine }) => {
  const styles = {
    instruction: 'text-xs text-text-dim font-medium mt-1',
    sub_question: 'text-sm text-text leading-relaxed pl-5 mt-2 flex items-start gap-2',
    option_item: 'text-sm text-text-muted leading-relaxed pl-8 mt-1 flex items-start gap-2',
    body: 'text-sm text-text leading-relaxed mt-1',
  };

  const bullets = {
    sub_question: <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />,
    option_item: <span className="w-1 h-1 rounded-full bg-text-dim shrink-0 mt-2" />,
  };

  return (
    <div className={styles[line.type]}>
      {(line.type === 'sub_question' || line.type === 'option_item') && bullets[line.type]}
      <span>{line.text}</span>
    </div>
  );
};

const BanglaWrittenView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const file = searchParams.get('file');
  const title = searchParams.get('title') || 'Bangla 2nd Paper';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BanglaWrittenData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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
        if (json._type !== 'bangla_written') throw new Error('Invalid question format');
        setData(json);
        const initial: Record<string, boolean> = {};
        json.sections.forEach((_: Section, i: number) => { initial[String(i)] = true; });
        setExpandedSections(initial);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [file]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
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

  if (!data?.sections?.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 text-text-dim mx-auto" />
          <p className="text-text-muted text-lg font-medium">No questions available</p>
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
              {data.examName} &bull; {data.totalQuestions} questions
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {data.sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface border rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => toggleSection(String(idx))}
              className="w-full flex items-center justify-between px-5 md:px-6 py-3.5 bg-surface-alt/50 hover:bg-surface-hover transition-colors border-b border-border/50"
            >
              <h2 className="text-sm font-black text-text tracking-tight">
                {section.name || `Section ${idx + 1}`}
              </h2>
              {expandedSections[String(idx)] ? (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              )}
            </button>

            {expandedSections[String(idx)] && (
              <div className="divide-y divide-border/50">
                {section.questions.map((q) => (
                    <div key={q.id} className="p-5 md:p-6">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                          {q.id}
                        </span>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          {parseQuestionLines(q.text).map((line, li) => (
                            <LineRenderer key={li} line={line} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BanglaWrittenView;
