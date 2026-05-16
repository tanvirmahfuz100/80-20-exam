import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Clock, Target, X } from 'lucide-react';
import LottieAnimation from '../components/LottieAnimation';
import searchAnimation from '../assets/search.json';

function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function highlightText(text, query) {
    if (!query || !text) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
            ? `<mark class="bg-primary/30 text-primary font-bold rounded-sm px-0.5">${part}</mark>`
            : part
    ).join('');
}

function extractQuestionsFromData(data, filePath, meta) {
    const results = [];
    const push = (item) => {
        const text = item.question || item.text || item.question_text || item.stem || item.sentence || item.statement || item.passage_text || '';
        if (!text) return;
        const difficulty = item.difficulty || 'unknown';
        const year = item.year || item.exam_appearance || '';
        const id = item.id || item.question_id || `${meta.exam}_${Math.random().toString(36).slice(2, 8)}`;
        results.push({
            id: String(id),
            text: typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '',
            difficulty: ['easy', 'medium', 'hard'].includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() : 'unknown',
            exam: meta.exam,
            subject: meta.subject,
            topic: meta.topic,
            chapter: meta.chapter,
            year: String(year),
            file: filePath,
        });
    };

    if (Array.isArray(data)) {
        data.forEach(push);
    } else if (data?.questions && Array.isArray(data.questions)) {
        data.questions.forEach(push);
        if (data.questions.length === 0) return results;
    } else if (data?.passages && Array.isArray(data.passages)) {
        data.passages.forEach(p => {
            const text = p.passage_text || p.title || '';
            if (text) {
                const blanks = p.blanks?.map(b => b.correct_answer || b.correct || '').filter(Boolean).join(', ') || '';
                results.push({
                    id: `${meta.exam}_${p.id || Math.random().toString(36).slice(2, 8)}`,
                    text: `${text}${blanks ? ` [${blanks}]` : ''}`.replace(/\s+/g, ' ').trim(),
                    difficulty: 'unknown',
                    exam: meta.exam,
                    subject: meta.subject,
                    topic: meta.topic,
                    chapter: meta.chapter,
                    year: '',
                    file: filePath,
                });
            }
        });
    } else if (data?.subQuestions && Array.isArray(data.subQuestions)) {
        data.subQuestions.forEach(push);
    } else if (data?.items && Array.isArray(data.items)) {
        data.items.forEach(push);
    }

    return results;
}

function parseYear(str) {
    if (!str) return '';
    const m = str.match(/\b(19\d{2}|20\d{2})\b/);
    return m ? m[1] : '';
}

const QuestionBank = () => {
    const [allQuestions, setAllQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [exactMatch, setExactMatch] = useState(false);
    const [filters, setFilters] = useState({ category: 'All', difficulty: 'All', subject: 'All', topic: 'All', year: 'All' });
    const [page, setPage] = useState(1);
    const [searchTime, setSearchTime] = useState(0);
    const inputRef = useRef(null);
    const debouncedSearch = useDebounce(searchTerm, 300);
    const perPage = 15;

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const exams = [
            { id: 'ssc', label: 'SSC' },
            { id: 'hsc', label: 'HSC' },
            { id: 'iba', label: 'IBA' },
        ];

        (async () => {
            setLoading(true);
            const all = [];

            for (const exam of exams) {
                try {
                    const idxRes = await fetch(`${base}${exam.id}/index.json`);
                    if (!idxRes.ok) continue;
                    const idx = await idxRes.json();
                    const entries = [];

                    for (const sub of (idx.subjects || [])) {
                        for (const topic of (sub.topics || [])) {
                            for (const ch of (topic.chapters || [])) {
                                const fp = ch.file || ch.file_bn || null;
                                if (fp) entries.push({
                                    path: fp,
                                    exam: exam.label,
                                    subject: sub.name,
                                    topic: topic.name,
                                    chapter: ch.name,
                                });
                            }
                        }
                    }

                    for (let i = 0; i < entries.length; i += 10) {
                        const batch = entries.slice(i, i + 10);
                        setLoadProgress(`Indexing ${exam.label}... (${Math.min(i + 10, entries.length)}/${entries.length})`);
                        const fetched = await Promise.all(
                            batch.map(async (e) => {
                                try {
                                    const url = e.path.startsWith('/') ? `${base}${e.path.slice(1)}` : e.path;
                                    const res = await fetch(url);
                                    if (!res.ok) return [];
                                    const data = await res.json();
                                    return extractQuestionsFromData(data, e.path, e);
                                } catch { return []; }
                            })
                        );
                        all.push(...fetched.flat());
                    }
                } catch { /* skip exam */ }
            }

            setAllQuestions(all);
            setLoadProgress(`Indexed ${all.length} questions`);
            setLoading(false);
            setTimeout(() => setLoadProgress(''), 2000);
        })();
    }, []);

    useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

    const availableFilters = useMemo(() => {
        const cats = new Set(); const diffs = new Set(); const subs = new Set(); const tops = new Set(); const yrs = new Set();
        allQuestions.forEach(q => {
            cats.add(q.exam); diffs.add(q.difficulty); subs.add(q.subject); tops.add(q.topic);
            if (q.year) yrs.add(q.year);
        });
        return {
            category: ['All', ...Array.from(cats).sort()],
            difficulty: ['All', ...Array.from(diffs).sort()],
            subject: ['All', ...Array.from(subs).sort()],
            topic: ['All', ...Array.from(tops).sort()],
            year: ['All', ...Array.from(yrs).sort()],
        };
    }, [allQuestions]);

    const results = useMemo(() => {
        const t0 = performance.now();
        let filtered = allQuestions;

        if (debouncedSearch) {
            const terms = exactMatch
                ? [debouncedSearch.toLowerCase()]
                : debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
            if (terms.length > 0) {
                filtered = filtered.filter(q => {
                    const text = q.text.toLowerCase();
                    return terms.every(t => text.includes(t));
                });
            }
        }

        if (filters.category !== 'All') filtered = filtered.filter(q => q.exam === filters.category);
        if (filters.difficulty !== 'All') filtered = filtered.filter(q => q.difficulty === filters.difficulty.toLowerCase());
        if (filters.subject !== 'All') filtered = filtered.filter(q => q.subject === filters.subject);
        if (filters.topic !== 'All') filtered = filtered.filter(q => q.topic === filters.topic);
        if (filters.year !== 'All') filtered = filtered.filter(q => q.year === filters.year);

        const elapsed = performance.now() - t0;
        setSearchTime(elapsed);
        return filtered;
    }, [allQuestions, debouncedSearch, exactMatch, filters]);

    const totalPages = Math.ceil(results.length / perPage) || 1;
    const paginated = results.slice((page - 1) * perPage, page * perPage);

    const clearAll = () => {
        setSearchTerm('');
        setFilters({ category: 'All', difficulty: 'All', subject: 'All', topic: 'All', year: 'All' });
        setPage(1);
        inputRef.current?.focus();
    };

    const anyFilterActive = Object.values(filters).some(v => v !== 'All') || searchTerm;

    return (
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
            <div className="bg-surface border border-white/5 p-4 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-[200px] h-[200px] md:w-[260px] md:h-[260px] opacity-20 pointer-events-none z-0">
                    <LottieAnimation src={searchAnimation} className="w-full h-full" pingPong />
                </div>
                <div className="relative z-10 flex items-start gap-4 mb-3 md:mb-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter">
                            BRAIN <span className="text-primary uppercase">SEARCH.</span>
                        </h1>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-[9px] mt-0.5">
                            {loading ? loadProgress || 'Loading...' : `${allQuestions.length} questions indexed`}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-2 md:gap-3">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search questions across SSC, HSC, IBA..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-white/5 pl-10 md:pl-12 pr-3 py-3 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={() => inputRef.current?.focus()}
                        className="px-5 py-3 bg-primary hover:bg-primary-hover text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        {loading ? 'Indexing' : 'Search'}
                    </button>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                        {Object.entries(availableFilters).map(([key, options]) => (
                            <select
                                key={key}
                                value={filters[key]}
                                onChange={(e) => setFilters(f => ({ ...f, [key]: e.target.value }))}
                                className="bg-background border border-white/5 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 focus:text-white outline-none focus:border-primary/30 transition-all appearance-none cursor-pointer"
                            >
                                {options.map(o => (
                                    <option key={o} value={o}>{o === 'All' ? `All ${key}s` : o}</option>
                                ))}
                            </select>
                        ))}
                    </div>
                    <button
                        onClick={() => setExactMatch(p => !p)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${exactMatch
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'bg-white/5 text-white/20 border-white/5 hover:text-white/40'
                            }`}
                    >
                        Exact
                    </button>
                </div>
            </div>

            {loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">{loadProgress || 'Loading questions...'}</p>
                </div>
            )}

            {!loading && (
                <>
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-bold text-white/30">
                            {results.length > 0
                                ? `${results.length} result${results.length !== 1 ? 's' : ''} found in ${(searchTime / 1000).toFixed(2)}s`
                                : 'No results'}
                        </p>
                        {anyFilterActive && (
                            <button onClick={clearAll} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                                <X className="w-2.5 h-2.5" /> Clear
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {paginated.map((q, i) => (
                            <div key={`${q.id}-${i}`} className="bg-surface border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group">
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-[9px] font-black text-white/10 tabular-nums mt-0.5 shrink-0">{(page - 1) * perPage + i + 1}.</span>
                                    <h3
                                        className="text-sm font-bold text-white/80 leading-relaxed tracking-tight group-hover:text-white transition-colors"
                                        dangerouslySetInnerHTML={{ __html: highlightText(q.text, debouncedSearch) }}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                                        q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                            q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                                'bg-white/5 text-white/20'
                                        }`}>{q.difficulty}</span>
                                    <span>{q.exam}</span>
                                    <span className="text-white/10">·</span>
                                    <span>{q.subject}</span>
                                    <span className="text-white/10">·</span>
                                    <span>{q.topic}</span>
                                    {q.year && (
                                        <>
                                            <span className="text-white/10">·</span>
                                            <span>{q.year}</span>
                                        </>
                                    )}
                                    <div className="ml-auto flex items-center gap-2 text-white/10">
                                        <Target className="w-2.5 h-2.5" />
                                        <span className="text-emerald-500/40">68%</span>
                                        <Clock className="w-2.5 h-2.5" />
                                        <span className="text-blue-500/40">45s</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {results.length === 0 && !loading && (
                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
                            <div className="w-16 h-16 opacity-20">
                                <LottieAnimation src={searchAnimation} className="w-full h-full" pingPong />
                            </div>
                            <p className="text-white/10 font-black uppercase tracking-widest text-[11px]">
                                {anyFilterActive ? 'No questions match your criteria' : 'Start typing to search'}
                            </p>
                            {anyFilterActive && (
                                <button onClick={clearAll} className="text-primary font-black uppercase tracking-widest text-[9px] hover:underline">Clear All Filters</button>
                            )}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20 border border-white/5 active:scale-95"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary">
                                Page {page} of {totalPages}
                            </div>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20 border border-white/5 active:scale-95"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default QuestionBank;
