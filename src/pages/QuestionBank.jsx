import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Loader2, Clock, Target, X } from 'lucide-react';
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

function FilterDropdown({ label, options, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <div ref={ref} className={`relative ${open ? 'z-50' : ''}`}>
            <button
                onClick={() => setOpen(p => !p)}
                className="flex items-center gap-1 bg-background border border-white/5 rounded-lg px-3 py-2 hover:border-white/20 transition-colors text-[9px] font-black uppercase tracking-widest min-w-0 w-full"
            >
                <span className="text-white/30 truncate">{label}</span>
                {value !== 'All' && (
                    <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded text-[8px] leading-none truncate max-w-[64px] shrink-0">
                        {value}
                    </span>
                )}
                <ChevronDown className={`w-3 h-3 text-white/20 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && isMobile && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
                        <motion.div
                            className="relative w-full bg-zinc-900 border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            style={{ maxHeight: '70vh' }}
                        >
                            <div className="shrink-0 pt-2 pb-1 flex items-center justify-center">
                                <div className="w-8 h-1 bg-white/20 rounded-full" />
                            </div>
                            <div className="overflow-y-auto p-2 flex-1 min-h-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                                {options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { onChange(opt); setOpen(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center min-h-[48px] gap-3 hover:bg-white/5 ${
                                            opt === value
                                                ? 'text-primary bg-primary/8'
                                                : 'text-white/50'
                                        }`}
                                    >
                                        <span className={`w-4 shrink-0 ${opt === value ? 'text-primary' : 'text-transparent'}`}>
                                            {opt === value && 'âœ“'}
                                        </span>
                                        <span className="truncate">{opt === 'All' ? 'All' : opt}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {open && !isMobile && (
                    <motion.div
                        className="absolute top-full left-0 mt-1.5 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 max-h-[50vh] overflow-y-auto"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                    >
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setOpen(false); }}
                                className={`w-full text-left px-3.5 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all min-h-[44px] flex items-center gap-2.5 hover:bg-white/5 ${
                                    opt === value
                                        ? 'text-primary bg-primary/8'
                                        : 'text-white/40'
                                }`}
                            >
                                <span className={`w-3.5 shrink-0 ${opt === value ? 'text-primary' : 'text-transparent'}`}>
                                    {opt === value && 'âœ“'}
                                </span>
                                <span className="truncate">{opt === 'All' ? 'All' : opt}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
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
            { id: 'class7', label: 'Class 7' },
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
        const cats = new Set(['SSC', 'HSC', 'IBA']);
        const diffs = new Set(['easy', 'medium', 'hard']);
        const subs = new Set(); const tops = new Set(); const yrs = new Set();
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
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            <div className="bg-surface border border-white/5 p-5 md:p-10 rounded-2xl md:rounded-[2rem] shadow-lg relative">
                <div className="absolute -right-8 -top-8 w-[200px] h-[200px] md:w-[260px] md:h-[260px] opacity-20 pointer-events-none z-0">
                    <LottieAnimation src={searchAnimation} className="w-full h-full" pingPong />
                </div>

                <div className="relative z-10">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter mb-1">
                        BRAIN <span className="text-primary">SEARCH.</span>
                    </h1>
                    <p className="text-white/25 font-bold uppercase tracking-widest text-[10px] md:text-[11px]">
                        {loading ? loadProgress || 'Loading...' : `${allQuestions.length.toLocaleString()} questions indexed`}
                    </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-3 md:gap-4 mt-5 md:mt-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search questions across SSC, HSC, IBA..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-white/5 pl-11 pr-4 py-4 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm placeholder:text-white/15"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={() => inputRef.current?.focus()}
                        className="px-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[11px] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] transition-all active:scale-[0.97] shrink-0 flex items-center justify-center gap-2.5"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        {loading ? 'Indexing' : 'Search'}
                    </button>
                </div>

                <div className="relative z-10 mt-5 md:mt-6 pt-5 md:pt-6 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                        <Filter className="w-3 h-3 text-white/15" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/15">Filters</span>
                        {anyFilterActive && (
                            <button onClick={clearAll} className="ml-auto text-[8px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-2">
                        {Object.entries(availableFilters).map(([key, options]) => (
                            <FilterDropdown
                                key={key}
                                label={key.charAt(0).toUpperCase() + key.slice(1)}
                                options={options}
                                value={filters[key]}
                                onChange={(v) => setFilters(f => ({ ...f, [key]: v }))}
                            />
                        ))}
                        <button
                            onClick={() => setExactMatch(p => !p)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all w-full ${
                                exactMatch
                                    ? 'bg-primary/15 text-primary border-primary/30'
                                    : 'bg-background text-white/20 border-white/5 hover:text-white/40 hover:border-white/20'
                            }`}
                        >
                            Exact
                        </button>
                    </div>
                </div>
            </div>

            {loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[11px]">{loadProgress || 'Loading questions...'}</p>
                </div>
            )}

            {!loading && (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-white/30">
                            {results.length > 0
                                ? `${results.length.toLocaleString()} result${results.length !== 1 ? 's' : ''} found in ${(searchTime / 1000).toFixed(2)}s`
                                : 'No results'}
                        </p>
                        {anyFilterActive && (
                            <button onClick={clearAll} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/5">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {paginated.map((q, i) => (
                            <div key={`${q.id}-${i}`} className="bg-surface border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-[10px] font-black text-white/10 tabular-nums mt-0.5 shrink-0 w-6 text-right">{(page - 1) * perPage + i + 1}.</span>
                                    <h3
                                        className="text-sm md:text-base font-bold text-white/80 leading-relaxed tracking-tight group-hover:text-white transition-colors"
                                        dangerouslySetInnerHTML={{ __html: highlightText(q.text, debouncedSearch) }}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest ml-9">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                        q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                                        q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                        q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                        'bg-white/5 text-white/20'
                                    }`}>{q.difficulty}</span>
                                    <span className="text-white/30">{q.exam}</span>
                                    <span className="text-white/10">Â·</span>
                                    <span className="text-white/30">{q.subject}</span>
                                    <span className="text-white/10">Â·</span>
                                    <span className="text-white/30">{q.topic}</span>
                                    {q.year && (
                                        <>
                                            <span className="text-white/10">Â·</span>
                                            <span className="text-white/30">{q.year}</span>
                                        </>
                                    )}
                                    <div className="ml-auto flex items-center gap-3 text-white/10">
                                        <div className="flex items-center gap-1.5">
                                            <Target className="w-3 h-3" />
                                            <span className="text-emerald-500/50 font-black">68%</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-blue-500/50 font-black">45s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {results.length === 0 && !loading && (
                        <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-4">
                            <div className="w-20 h-20 opacity-15">
                                <LottieAnimation src={searchAnimation} className="w-full h-full" pingPong />
                            </div>
                            <p className="text-white/10 font-black uppercase tracking-widest text-xs">
                                {anyFilterActive ? 'No questions match your criteria' : 'Type something to search'}
                            </p>
                            {anyFilterActive && (
                                <button onClick={clearAll} className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Clear All Filters</button>
                            )}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 pt-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20 border border-white/5 active:scale-95 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-primary tabular-nums">
                                Page {page} of {totalPages}
                            </div>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20 border border-white/5 active:scale-95 transition-all"
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
