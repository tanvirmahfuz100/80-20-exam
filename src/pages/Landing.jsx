import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Zap, BookOpen, GraduationCap, Users } from 'lucide-react';
const HeroImage = 'hero-illustration.png';

const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-between gap-16">
                <div className="flex-1 text-center lg:text-left space-y-8 animate-in slide-in-from-left-10 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-black uppercase tracking-widest text-[10px]">
                        <Star className="w-3 h-3 fill-current" />
                        The #1 Choice for IBA Preparation
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-[0.9] uppercase">
                        The free, fun, and <span className="text-primary not-italic">effective</span> way to pass IBA!
                    </h1>
                    <p className="text-white/40 text-lg md:text-xl font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                        Join thousands of students mastering Math, English, and Analytical subjects with our bite-sized lessons and <span className="text-white font-bold">50,000+ practice questions</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(94,106,210,0.3)] flex items-center justify-center gap-3"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10 flex items-center justify-center gap-3"
                        >
                            I Already Have an Account
                        </Link>
                    </div>
                </div>
                <div className="flex-1 relative animate-in zoom-in-95 duration-1000">
                    <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>
                    <img
                        src={HeroImage}
                        alt="Hero"
                        className="relative z-10 w-full max-w-lg mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-3 hover:rotate-0 transition-transform duration-700"
                    />
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
                            Access the largest database of IBA questions ever built. Every single one comes with detailed explanations.
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
                    Master IBA Today!
                </h2>
                <p className="text-white/40 text-xl font-medium">
                    Create a profile now to start your streak and compete with other students on the global leaderboard.
                </p>
                <div className="flex justify-center pt-8">
                    <Link
                        to="/register"
                        className="px-12 py-6 bg-primary hover:bg-primary-hover text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(94,106,210,0.4)] flex items-center gap-4"
                    >
                        Create My Profile
                    </Link>
                </div>
            </div>

            {/* Footer Minimal */}
            <footer className="py-12 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
                &copy; 2024 IBA Practice Platform • Learning Reimagined
            </footer>
        </div>
    );
};

export default Landing;
