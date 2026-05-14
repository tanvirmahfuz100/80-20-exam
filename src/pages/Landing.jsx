import React, { useEffect, useState } from 'react';
import AnimatedTextCycle from '@/components/ui/animated-text-cycle.jsx';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap, BookOpen, Users, GraduationCap } from 'lucide-react';
import { Books, Target, StudyDesk } from '../components/Illustrations';

const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <div className="max-w-7xl mx-auto px-6 py-16 md:py-32 flex flex-col items-center justify-center text-center space-y-8 md:space-y-12">
                <div className="space-y-6 md:space-y-8 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-black uppercase tracking-widest text-[10px]">
                        <Star className="w-3 h-3 fill-current" />
                        Master Any Competitive Exam
                    </div>
                    <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                        The free, fun, and <span className="text-primary">effective</span> way to ace competitive <span className="inline-block align-middle"><AnimatedTextCycle words={["exams","assessments","tests","quizzes"]} interval={3000} className="text-primary"/></span>!
                    </h1>
                    <p className="text-white/40 text-base md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                        Join thousands of students preparing for IBA, BCS, SSC, SAT, GRE, and more with our bite-sized lessons and <span className="text-white font-bold">50,000+ practice questions</span> covering Math, English, and Analytical reasoning.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-6 md:pt-8">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-primary hover:bg-primary-hover text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 hover:scale-[1.02] shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
                        >
                            Start Testing
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10 flex items-center justify-center gap-3"
                        >
                            Continue to App
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-surface/30 border-y border-white/5 py-16 md:py-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
                    <div className="space-y-5 md:space-y-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                            <Zap className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Free. Fun. Effective.</h3>
                        <p className="text-white/30 text-sm leading-relaxed max-w-xs mx-auto">
                            Learning with us is fun, and research shows it works! Earn points and unlock new levels while gaining real-world skills.
                        </p>
                    </div>
                    <div className="space-y-5 md:space-y-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-lg">
                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase">50,000+ Questions</h3>
                        <p className="text-white/30 text-sm leading-relaxed max-w-xs mx-auto">
                            Access a massive local question library for competitive exams. IBA, BCS, SSC, SAT, GRE, and more. Every single one comes with detailed explanations.
                        </p>
                    </div>
                    <div className="space-y-5 md:space-y-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-yellow-500/20 shadow-lg">
                            <Users className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Personalized Path</h3>
                        <p className="text-white/30 text-sm leading-relaxed max-w-xs mx-auto">
                            Our AI adapts to your learning pace and focuses on your weak points to help you study smarter, not harder.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-16 md:py-32 text-center space-y-8 md:space-y-12">
                <div className="inline-flex p-4 md:p-6 bg-primary/10 rounded-2xl md:rounded-[2.5rem] border border-primary/20">
                    <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tight uppercase leading-none">
                    Start Your Exam Prep Today!
                </h2>
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase">Choose Your Exam</h3>
                    <ExamTiles />
                </div>

                <div className="flex justify-center pt-6 md:pt-8">
                    <Link
                        to="/login"
                        className="px-8 md:px-12 py-5 md:py-6 bg-primary hover:bg-primary-hover text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all active:scale-95 hover:scale-[1.02] shadow-lg shadow-primary/30 flex items-center gap-4"
                    >
                        Enter Test Mode
                    </Link>
                </div>
            </div>

            <footer className="py-8 md:py-12 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
                &copy; 2024 80-20 Exam Platform &bull; Learning Reimagined
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
        <div className="text-white/40">No exams available yet.</div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {exams.map(exam => (
                <Link key={exam.id} to={`/practice?category=${exam.id.toUpperCase()}`} className="p-5 md:p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary transition-all flex items-center justify-between active:scale-[0.98]">
                    <div className="text-left">
                        <h4 className="text-lg md:text-xl font-black">{exam.name}</h4>
                        <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-widest mt-1">Start practicing {exam.name} lessons</p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full shrink-0">
                        <ArrowRight className="w-4 h-5 md:w-5 text-primary" />
                    </div>
                </Link>
            ))}
        </div>
    );
};
