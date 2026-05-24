import React from 'react';
import { X, BookOpen, Target, Brain, TrendingUp, Video, ClipboardList } from 'lucide-react';

const tips = [
    {
        icon: Target,
        title: 'Practice Questions',
        desc: 'Go to Practice to pick an exam, subject, and lesson. Each lesson has 10-20 questions. Answer them and get instant feedback.',
        path: '/practice'
    },
    {
        icon: BookOpen,
        title: 'Explore Courses',
        desc: 'Courses has video lessons from top instructors. Filter by exam category and start learning at your own pace.',
        path: '/courses'
    },
    {
        icon: Brain,
        title: 'Question Bank',
        desc: 'Search 50,000+ questions by keyword, difficulty, or exam. Bookmark your favorites and track your accuracy.',
        path: '/bank'
    },
    {
        icon: ClipboardList,
        title: 'Mock Tests',
        desc: 'Simulate real exam conditions with timed, full-length mock tests. Auto-graded with detailed solutions.',
        path: '/mock-tests'
    },
    {
        icon: TrendingUp,
        title: 'Track Progress',
        desc: 'Analytics shows your accuracy, consistency, strengths, and weak areas. Export your data anytime.',
        path: '/analytics'
    },
    {
        icon: Video,
        title: 'Short Bits',
        desc: 'Quick, scrollable video lessons for last-minute revision. Perfect for learning on the go.',
        path: '/shorts'
    },
];

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-xl text-white/30 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-1 mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tighter">How to use Fireman</h2>
                    <p className="text-sm text-white/40 font-medium">Everything you need to ace your exams — here is how it works.</p>
                </div>

                <div className="space-y-3">
                    {tips.map((tip) => (
                        <div key={tip.title} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <tip.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-black text-white">{tip.title}</h4>
                                <p className="text-xs text-white/50 mt-1 leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <p className="text-xs text-white/60 font-medium leading-relaxed">
                        <span className="text-primary font-black">Pro tip:</span> Wrong answers are automatically saved for spaced-repetition review. Tap the star icon in the top bar anytime to revisit your mistakes.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-4 bg-primary hover:bg-primary-hover text-black rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] border-b-4 border-primary-hover active:border-b-0 active:translate-y-[2px]"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export default GuideModal;
