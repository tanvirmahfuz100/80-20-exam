import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Zap, BookOpen, GraduationCap, Users } from 'lucide-react';
const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-1000">
                <div className="space-y-8 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-black uppercase tracking-widest text-[10px]">
                        <Star className="w-3 h-3 fill-current" />
                        Master Any Competitive Exam
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase">
                        The free, fun, and <span className="text-primary not-italic">effective</span> way to ace competitive exams!
                    </h1>
                    <p className="text-white/40 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto">
                        Join thousands of students preparing for IBA, BCS, SSC, SAT, GRE, and more with our bite-sized lessons and <span className="text-white font-bold">50,000+ practice questions</span> covering Math, English, and Analytical reasoning.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-12 py-6 bg-primary hover:bg-primary-hover text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(94,106,210,0.3)] flex items-center justify-center gap-3"
                        >
                            Start Testing
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-12 py-6 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10 flex items-center justify-center gap-3"
                        >
                            Continue to App
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-surface/30 border-y border-white/5 py-32">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl">
                            <Zap className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Free. Fun. Effective.</h3>
                        <p className="text-white/30 text-sm leading-relaxed">
                            Learning with us is fun, and research shows it works! Earn points and unlock new levels while gaining real-world skills.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-2xl">
                            <BookOpen className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">50,000+ Questions</h3>
                        <p className="text-white/30 text-sm leading-relaxed">
                            Access a massive local question library for competitive exams. IBA, BCS, SSC, SAT, GRE, and more. Every single one comes with detailed explanations.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto border border-yellow-500/20 shadow-2xl">
                            <Users className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Personalized Path</h3>
                        <p className="text-white/30 text-sm leading-relaxed">
                            Our AI adapts to your learning pace and focuses on your weak points to help you study smarter, not harder.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-6 py-32 text-center space-y-12">
                <div className="inline-flex p-6 bg-primary/10 rounded-[2.5rem] border border-primary/20">
                    <GraduationCap className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tight uppercase leading-none">
                    Start Your Exam Prep Today!
                </h2>
                {/* Exams Selector */}
                <div className="max-w-7xl mx-auto px-6 py-24">
                    <h3 className="text-3xl font-black text-white mb-6 uppercase">Choose Your Exam</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { id: 'ssc', name: 'SSC' },
                            { id: 'hsc', name: 'HSC' },
                            { id: 'iba', name: 'IBA' },
                            { id: 'bcs', name: 'BCS' }
                        ].map(exam => (
                            <Link key={exam.id} to={`/practice?category=${exam.id.toUpperCase()}`} className="p-6 rounded-2xl bg-surface border border-white/5 hover:border-primary transition-all flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-black">{exam.name}</h4>
                                    <p className="text-xs text-white/30 uppercase tracking-widest mt-1">Start practicing {exam.name} lessons</p>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                                    <ArrowRight className="w-5 h-5 text-primary" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer Minimal */}
                <div className="flex justify-center pt-8">
                    <Link
                        to="/login"
                        className="px-12 py-6 bg-primary hover:bg-primary-hover text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(94,106,210,0.4)] flex items-center gap-4"
                    >
                        Enter Test Mode
                    </Link>
                </div>
            </div>

            {/* Footer Minimal */}
            <footer className="py-12 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
                &copy; 2024 80-20 Exam Platform • Learning Reimagined
            </footer>
        </div>
    );
};

export default Landing;
