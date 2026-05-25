import React, { useEffect, useState } from 'react';
import AnimatedTextCycle from '@/components/ui/animated-text-cycle.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap, BookOpen, Users, GraduationCap, Sun, Moon } from 'lucide-react';
import { Books, Target, StudyDesk } from '../components/Illustrations';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
    const { theme, setTheme } = useTheme();
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/30 overflow-x-hidden">
            <div className="w-full flex items-center justify-center gap-3 pt-4 md:pt-6">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-text-muted">মোড</span>
                <div className="flex bg-surface-alt border rounded-xl p-0.5 gap-0.5">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
                            theme === 'light'
                                ? 'bg-background text-text shadow-sm border'
                                : 'text-text-muted hover:text-text'
                        }`}
                    >
                        <Sun className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-1 px-2.5 md:px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
                            theme === 'dark'
                                ? 'bg-background text-text shadow-sm border'
                                : 'text-text-muted hover:text-text'
                        }`}
                    >
                        <Moon className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-32 flex flex-col items-center justify-center text-center space-y-6 md:space-y-12">
                <div className="space-y-4 md:space-y-8 max-w-4xl w-full">
                    <div className="flex justify-center mb-4">
              <img
                src={`${import.meta.env.BASE_URL || '/'}mascot-celebrating.png`}
                alt="Mascot"
                className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-black uppercase tracking-widest text-[8px] md:text-[10px]">
                        <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                        যেকোনো প্রতিযোগিতামূলক পরীক্ষায় মাস্টার
                    </div>
                    <h1 className="text-3xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-balance">
                        প্রতিযোগিতামূলক পরীক্ষায় সাফল্যের <span className="text-primary">ফ্রি, ফান</span> ও কার্যকর উপায়! <span className="inline-block align-middle"><AnimatedTextCycle words={["এক্সাম","অ্যাসেসমেন্ট","টেস্ট","কুইজ"]} interval={3000} className="text-primary"/></span>
                    </h1>
                    <p className="text-text-muted text-sm md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                        আইবিএ, বিসিএস, এসএসসি, স্যাট, জিআরই'র জন্য হাজারো শিক্ষার্থীর সাথে যোগ দাও আমাদের ছোট ছোট লেসন আর <span className="text-text font-bold">৫০,০০০+ প্রাক্টিস প্রশ্ন</span> নিয়ে গণিত, ইংরেজি ও অ্যানালিটিক্যাল রিজনিং কভার করে।
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 pt-4 md:pt-8">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-6 md:px-12 py-4 md:py-6 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all active:scale-95 hover:scale-[1.02] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] flex items-center justify-center gap-2 md:gap-3"
                        >
                            টেস্টিং শুরু করো
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-6 md:px-12 py-4 md:py-6 bg-surface-alt hover:bg-surface-alt text-text rounded-xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all border flex items-center justify-center gap-2 md:gap-3"
                        >
                            অ্যাপে যাও
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-surface border-y border py-10 md:py-32">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 text-center">
                    <div className="space-y-3 md:space-y-6">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                            <Zap className="w-6 h-6 md:w-10 md:h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">ফ্রি। ফান। ইফেক্টিভ।</h3>
                        <p className="text-text-dim text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                            আমাদের সাথে শেখা মজার, আর গবেষণা বলেছে এটি কাজ করে! পয়েন্ট অর্জন করো, নতুন লেভেল আনলক করো এবং বাস্তব দক্ষতা অর্জন করো।
                        </p>
                    </div>
                    <div className="space-y-3 md:space-y-6">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-lg">
                            <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-primary" />
                        </div>
                        <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">৫০,০০০+ প্রশ্ন</h3>
                        <p className="text-text-dim text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                            প্রতিযোগিতামূলক পরীক্ষার জন্য বিশাল প্রশ্ন লাইব্রেরি। আইবিএ, বিসিএস, এসএসসি, স্যাট, জিআরই ও আরো অনেক কিছু। প্রতিটি প্রশ্নের সাথে বিস্তারিত ব্যাখ্যা আছে।
                        </p>
                    </div>
                    <div className="space-y-3 md:space-y-6">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-yellow-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-yellow-500/20 shadow-lg">
                            <Users className="w-6 h-6 md:w-10 md:h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">পার্সোনালাইজড পাথ</h3>
                        <p className="text-text-dim text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                            আমাদের এআই তোমার শেখার গতির সাথে খাপ খায় এবং দুর্বল পয়েন্টে ফোকাস করে স্মার্টারলি পড়তে সাহায্য করে।
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-32 text-center space-y-6 md:space-y-12">
                <div className="inline-flex p-3 md:p-6 bg-primary/10 rounded-2xl md:rounded-[2.5rem] border border-primary/20">
                    <GraduationCap className="w-10 h-10 md:w-16 md:h-16 text-primary" />
                </div>
                <h2 className="text-2xl md:text-6xl font-black tracking-tight uppercase leading-none text-balance">
                    আজই শুরু করো তোমার এক্সাম প্রেপ!
                </h2>
                <div className="max-w-7xl mx-auto px-0 md:px-6 py-8 md:py-24">
                    <h3 className="text-xl md:text-3xl font-black text-text mb-4 md:mb-6 uppercase">তোমার এক্সাম বেছে নাও</h3>
                    <ExamTiles />
                </div>

                <div className="flex justify-center pt-4 md:pt-8">
                    <Link
                        to="/login"
                        className="px-6 md:px-12 py-4 md:py-6 bg-primary hover:bg-primary-hover text-white rounded-xl md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs md:text-sm transition-all active:scale-95 hover:scale-[1.02] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] flex items-center gap-3 md:gap-4"
                    >
                        টেস্ট মোডে যাও
                    </Link>
                </div>
            </div>

            <footer className="py-6 md:py-12 border-t border text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-text-dim">
                &copy; ২০২৪ ফায়ারম্যান &bull; লার্নিং রিইমাজিনড
            </footer>
        </div>
    );
};

export default Landing;

const ExamTiles = () => {
    const [exams, setExams] = useState([]);

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const labels = {
            ssc: 'SSC',
            iba: 'IBA',
            gmat: 'GMAT',
            gre: 'GRE',
            sat: 'SAT',
            hsc: 'HSC',
            bcs: 'BCS'
        };
        const candidates = Object.keys(labels);

        Promise.all(candidates.map(id => {
            const url = `${base}${id}/index.json`.replace(/\/\/+/, '/');
            return fetch(url)
                .then(async r => {
                    if (!r.ok) return null;
                    const json = await r.json();
                    return Array.isArray(json.subjects) && json.subjects.length > 0 ? { id, name: labels[id] || id.toUpperCase(), url } : null;
                })
                .catch(() => null);
        })).then(results => {
            const available = results.filter(Boolean);
            setExams(available);
        });
    }, []);

    if (exams.length === 0) return (
        <div className="text-text-muted">কোনো এক্সাম উপলব্ধ নয়।</div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {exams.map(exam => (
                <Link key={exam.id} to={`/practice?category=${exam.id.toUpperCase()}`} className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-surface border hover:border-primary transition-all flex items-center justify-between active:scale-[0.98]">
                    <div className="text-left min-w-0 flex-1">
                        <h4 className="text-base md:text-xl font-black truncate">{exam.name}</h4>
                        <p className="text-[9px] md:text-xs text-text-dim uppercase tracking-widest mt-0.5 md:mt-1">{exam.name} লেসন প্রাক্টিস শুরু করো</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full shrink-0 ml-2">
                        <ArrowRight className="w-3.5 h-3.5 md:w-5 text-primary" />
                    </div>
                </Link>
            ))}
        </div>
    );
};
