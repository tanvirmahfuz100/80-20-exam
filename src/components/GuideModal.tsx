import React from 'react';
import { X, BookOpen, Target, Brain, TrendingUp, Video, ClipboardList } from 'lucide-react';

const tips = [
    {
        icon: Target,
        title: 'প্রাক্টিস প্রশ্ন',
        desc: 'প্রাক্টিসে গিয়ে এক্সাম, সাবজেক্ট ও লেসন বাছাই করো। প্রতিটি লেসনে ১০-২০টি প্রশ্ন থাকে। উত্তর দাও এবং ইনস্ট্যান্ট ফিডব্যাক পাও।',
        path: '/practice'
    },
    {
        icon: BookOpen,
        title: 'কোর্স এক্সপ্লোর করো',
        desc: 'কোর্সে টপ ইন্সট্রাক্টরদের ভিডিও লেসন আছে। এক্সাম ক্যাটাগরি অনুযায়ী ফিল্টার করো এবং নিজের গতিতে শেখা শুরু করো।',
        path: '/courses'
    },
    {
        icon: Brain,
        title: 'প্রশ্নব্যাংক',
        desc: '৫০,০০০+ প্রশ্ন কীওয়ার্ড, ডিফিকাল্টি বা এক্সাম অনুযায়ী খুঁজো। ফেভারিট বুকমার্ক করো এবং একিউরেসি ট্র্যাক করো।',
        path: '/bank'
    },
    {
        icon: ClipboardList,
        title: 'মক টেস্ট',
        desc: 'টাইমড, ফুল-লেংথ মক টেস্ট দিয়ে রিয়েল এক্সাম কন্ডিশন সিমুলেট করো। অটো-গ্রেডেড ডিটেইলড সলিউশনসহ।',
        path: '/mock-tests'
    },
    {
        icon: TrendingUp,
        title: 'প্রোগ্রেস ট্র্যাক করো',
        desc: 'অ্যানালিটিক্স তোমার একিউরেসি, কনসিস্টেন্সি, শক্তিমত্তা ও দুর্বলতা দেখায়। যেকোনো সময় ডাটা এক্সপোর্ট করো।',
        path: '/analytics'
    },
    {
        icon: Video,
        title: 'শর্ট বির্টস',
        desc: 'দ্রুত, স্ক্রলযোগ্য ভিডিও লেসন লাস্ট-মিনিট রিভিশনের জন্য। চলার পথে শেখার জন্য পারফেক্ট।',
        path: '/shorts'
    },
];

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface border rounded-3xl p-6 md:p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-surface-alt rounded-xl text-text-muted hover:text-text transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-1 mb-6">
                    <h2 className="text-2xl font-black text-text tracking-tighter bn-text">কীভাবে ফায়ারম্যান ব্যবহার করবেন</h2>
                    <p className="text-sm text-text-muted font-medium">Everything you need to ace your exams â€” এখানে তা কীভাবে কাজ করে।</p>
                </div>

                <div className="space-y-3">
                    {tips.map((tip) => (
                        <div key={tip.title} className="flex items-start gap-4 p-4 bg-surface-alt rounded-2xl border">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <tip.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-black text-text">{tip.title}</h4>
                                <p className="text-xs text-text-muted mt-1 leading-relaxed">{tip.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <p className="text-xs text-text-muted font-medium leading-relaxed">
                        <span className="text-primary font-black">প্রো টিপ:</span> ভুল উত্তরগুলো অটোমেটিক্যালি স্পেসড রিপিটিশনের জন্য সেভ হয়। যেকোনো সময় উপরের বার থেকে স্টার আইকনে ট্যাপ করে তোমার ভুলগুলো রিভিউ করো।
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] bn-text"
                >
                    বুঝেছি
                </button>
            </div>
        </div>
    );
};

export default GuideModal;
