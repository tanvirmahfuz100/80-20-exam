import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Save, Share2, MoreHorizontal, ChevronLeft, ChevronRight, BarChart3, Clock, Target } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuestionBank = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: 'All',
        difficulty: 'All',
        type: 'All'
    });
    const [page, setPage] = useState(1);
    const questionsPerPage = 10;

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            const apiFilters = {};
            if (filters.category !== 'All') apiFilters.category = filters.category;
            if (filters.difficulty !== 'All') apiFilters.difficulty = filters.difficulty.toLowerCase();

            const { data } = await api.getQuestions({ ...apiFilters, limit: 100 });
            setQuestions(data || []);
            setLoading(false);
        };
        fetchQuestions();
    }, [filters]);

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const paginatedQuestions = filteredQuestions.slice((page - 1) * questionsPerPage, page * questionsPerPage);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Search Base */}
            <div className="bg-surface border border-white/5 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Search size={200} />
                </div>

                <div className="relative z-10 max-w-3xl space-y-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">BRAIN <span className="text-primary not-italic uppercase">SEARCH.</span></h1>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-2">Explore 50,000+ archived questions with deep insights</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by keywords, years, or topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-14 pr-6 py-5 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm"
                            />
                        </div>
                        <button className="px-8 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0">
                            Search Now
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {['Exam Category', 'Difficulty', 'Subject', 'Topic', 'Year'].map(label => (
                            <button key={label} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                                <Filter className="w-3 h-3" /> {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1 space-y-8 h-fit lg:sticky lg:top-32">
                    <div className="bg-surface border border-white/5 rounded-3xl p-6 space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-5">Quick Filters</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Category</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="w-full mt-2 bg-background border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-primary/30"
                                    >
                                        <option>All</option>
                                        <option>IBA</option>
                                        <option>BCS</option>
                                        <option>Bank</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Difficulty</label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setFilters({ ...filters, difficulty: d })}
                                                className={`py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.difficulty === d ? 'bg-primary text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 text-center space-y-3">
                                <BarChart3 className="w-6 h-6 text-primary mx-auto opacity-50" />
                                <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Global Insights</h5>
                                <p className="text-[10px] text-white/30 font-medium">Most searched: <span className="text-primary italic">Algebra (BCS 2024)</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question List */}
                <div className="lg:col-span-3 space-y-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : paginatedQuestions.length > 0 ? (
                        <>
                            {paginatedQuestions.map((q, idx) => (
                                <div key={q.id} className="bg-surface border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                        <BookOpen size={80} />
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${q.difficulty === 'hard' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    }`}>
                                                    {q.difficulty}
                                                </span>
                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{q.exam_category} • {q.exam_type || 'General'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-white/20 hover:text-primary transition-colors">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-white/20 hover:text-white transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white leading-relaxed tracking-tight group-hover:text-primary transition-colors pr-8">
                                            {q.question_text}
                                        </h3>

                                        <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                                <Target className="w-3 h-3" /> Average Accuracy: <span className="text-emerald-500/60">68%</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" /> Avg Time: <span className="text-blue-500/60">45s</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-2 pt-8">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20 border border-white/5"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary">
                                    Page {page} of {totalPages || 1}
                                </div>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white disabled:opacity-20 border border-white/5"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] space-y-4">
                            <p className="text-white/10 font-black uppercase tracking-widest">No questions found matching your criteria</p>
                            <button onClick={() => { setSearchTerm(''); setFilters({ category: 'All', difficulty: 'All', type: 'All' }) }} className="text-primary font-black uppercase tracking-widest text-[9px]">Clear All Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionBank;
