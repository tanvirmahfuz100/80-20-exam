import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/LoadingScreen';
import {
    User, Mail, Phone, GraduationCap, CheckCircle2,
    Save, AlertCircle, Loader2, ShieldCheck, Sun, Moon,
    BookOpen, Bell, Globe, Lock, Palette, Layout,
    Download, Upload, Database, Trash2,
} from 'lucide-react';
import HomepageCustomizer from '../components/homepage/HomepageCustomizer';
import { useHomepageLayout } from '../hooks/useHomepageLayout';
import { ALL_CARDS, HOMEPAGE_CARD_META } from '../types/homepage';

const Settings = () => {
    const { user, profile, loading: authLoading, updateProfileFields } = useAuth();
    const { theme, setTheme, isDark, fontSize, setFontSize } = useTheme();
    const { isCardActive, toggleCard, resetToDefault } = useHomepageLayout();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        username: '',
        phone_number: '',
        target_exams: [],
        question_version: 'bangla'
    });

    const examOptions = [
        "IBA", "BCS", "Bank & Jobs", "Medical", "Engineering", "Chartered Accountancy"
    ];

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || user?.user_metadata?.username || '',
                phone_number: profile.phone_number || '',
                target_exams: profile.target_exams || [],
                question_version: profile.question_version || 'bangla'
            });
        }
    }, [profile, user]);

    const toggleExam = (exam) => {
        const current = formData.target_exams;
        if (current.includes(exam)) {
            setFormData({ ...formData, target_exams: current.filter(e => e !== exam) });
        } else {
            setFormData({ ...formData, target_exams: [...current, exam] });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const { error } = await api.updateProfile(user.id, {
                username: formData.username,
                phone_number: formData.phone_number,
                target_exams: formData.target_exams,
                question_version: formData.question_version,
                theme,
                fontSize: fontSize,
                updated_at: new Date().toISOString()
            });
            if (!error) updateProfileFields({ question_version: formData.question_version, theme, fontSize });
            if (error) throw error;
            setMessage({ type: 'success', text: 'প্রোফাইল আপডেট করা হয়েছে!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const importInputRef = useRef(null);
    const [backupMessage, setBackupMessage] = useState({ type: '', text: '' });

    const APP_KEYS = [
        'exam_local_auth',
        'exam_profiles',
        'exam_user_responses',
        'exam_practice_sessions',
        'exam_course_progress',
        'exam_mock_results',
        'exam_short_videos',
        'exam_video_engagement',
        'exam_subscriptions',
        'exam_activity_logs',
        'exam_reports',
        'exam_courses',
        'exam_mock_tests',
        'exam_levels_progress',
        'exam_user_stats',
        'exam_challenges',
        'exam_streak_data',
        'quiz_mistakes',
        'quiz_review_session',
        'quiz_star_balance',
        'daily_quiz_cache_v2',
        'duo-theme',
        'fireman-font-size',
        'quiz-font-size',
        'user_exam_path',
        'user_name',
        'fireman-mode-chosen',
        'exam_homepage_layout',
    ];

    const exportData = () => {
        try {
            const data = {};
            for (const key of APP_KEYS) {
                const raw = localStorage.getItem(key);
                if (raw !== null) {
                    try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
                }
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `opencode-80-20-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setBackupMessage({ type: 'success', text: 'ডেটা এক্সপোর্ট করা হয়েছে!' });
        } catch (err) {
            setBackupMessage({ type: 'error', text: 'এক্সপোর্ট ব্যর্থ: ' + err.message });
        }
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                let count = 0;
                for (const [key, value] of Object.entries(data)) {
                    if (APP_KEYS.includes(key)) {
                        try {
                            localStorage.setItem(key, JSON.stringify(value));
                            count++;
                        } catch { /* skip if key fails */ }
                    }
                }
                setBackupMessage({ type: 'success', text: `${count}টি আইটেম রিস্টোর করা হয়েছে। পৃষ্ঠা রিফ্রেশ করো।` });
            } catch {
                setBackupMessage({ type: 'error', text: 'ইমপোর্ট ব্যর্থ: ফাইল ফরম্যাট সঠিক নয়।' });
            }
        };
        reader.readAsText(file);
        if (importInputRef.current) importInputRef.current.value = '';
    };

    if (authLoading) return <LoadingScreen message="সেটিংস লোড হচ্ছে..." />;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-black text-text">সেটিংস</h1>
                    <p className="text-sm text-text-muted font-medium mt-0.5">তোমার লার্নিং এক্সপিরিয়েন্স কাস্টমাইজ করো</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-hover disabled:opacity-50 transition-all active:scale-95 shrink-0 shadow-sm"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    সেভ করো
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-3.5 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                    ? 'bg-primary/5 border-primary/20 text-primary'
                    : 'bg-cardinal/5 border-cardinal/20 text-cardinal'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <div className="space-y-4">
                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        পরিচয়
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1 bn-text">নাম</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="duo-input pl-10"
                                    placeholder="পূর্ণ নাম"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1 bn-text">ইমেইল</label>
                            <div className="relative opacity-60">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input type="email" value={user?.email} disabled className="duo-input pl-10 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1 bn-text">ফোন নম্বর</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="duo-input pl-10"
                                    placeholder="ফোন নম্বর"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-5 text-primary" />
                        স্টাডি ট্র্যাক
                    </h3>
                    <div className="space-y-2 mb-4">
                        {examOptions.map((exam) => (
                            <button
                                key={exam}
                                onClick={() => toggleExam(exam)}
                                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                                    formData.target_exams.includes(exam)
                                        ? 'bg-primary/5 border-primary/20 text-primary'
                                        : 'bg-surface border text-text-muted hover:border hover:text-text'
                                }`}
                            >
                                <span className="text-sm font-bold">{exam}</span>
                                {formData.target_exams.includes(exam) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1 bn-text">প্রশ্নের ভাষা</p>
                        <div className="flex gap-2">
                            {['bangla', 'english'].map((version) => (
                                <button
                                    key={version}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, question_version: version })}
                                    className={`flex-1 px-4 py-3 rounded-full border text-sm font-bold transition-all active:scale-[0.98] ${
                                        formData.question_version === version
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-surface border text-text-muted hover:border hover:text-text'
                                    }`}
                                >
                                    {version === 'bangla' ? 'বাংলা' : 'ইংরেজি'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                        অ্যাপিয়ারেন্স
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                    isDark ? 'bg-primary/5 border-primary' : 'bg-surface border'
                                }`}
                            >
                                <Moon className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-primary' : 'text-text-muted'}`} />
                                <p className={`text-sm font-bold ${isDark ? 'text-primary' : 'text-text'}`}>ডার্ক</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                    !isDark ? 'bg-primary/5 border-primary' : 'bg-surface border'
                                }`}
                            >
                                <Sun className={`w-6 h-6 mx-auto mb-2 ${!isDark ? 'text-primary' : 'text-text-muted'}`} />
                                <p className={`text-sm font-bold ${!isDark ? 'text-primary' : 'text-text'}`}>লাইট</p>
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 bn-text">টেক্সট সাইজ</p>
                            <div className="flex gap-2">
                                {['small', 'normal', 'large'].map((sz) => (
                                    <button
                                        key={sz}
                                        type="button"
                                        onClick={() => setFontSize(sz)}
                                        className={`flex-1 p-3 rounded-full border text-center text-sm font-bold transition-all ${
                                            fontSize === sz ? 'bg-primary text-white border-primary' : 'bg-surface border text-text-muted'
                                        }`}
                                    >
                                        {sz === 'small' ? 'ছোট' : sz === 'normal' ? 'নরমাল' : 'বড়'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-primary" />
                        হোমপেজ লেআউট
                    </h3>
                    <div className="space-y-3">
                        {ALL_CARDS.map((id) => {
                            const meta = HOMEPAGE_CARD_META[id];
                            const active = isCardActive(id);
                            return (
                                <button
                                    key={id}
                                    onClick={() => toggleCard(id)}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                                        active
                                            ? 'bg-primary/5 border-primary/20 text-primary'
                                            : 'bg-surface border text-text-muted hover:border hover:text-text'
                                    }`}
                                >
                                    <div>
                                        <p className="text-sm font-bold">{meta?.label || id}</p>
                                        <p className="text-xs text-text-muted mt-0.5">{meta?.description || ''}</p>
                                    </div>
                                    {active && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                </button>
                            );
                        })}
                        <button
                            onClick={resetToDefault}
                            className="w-full p-3 rounded-xl border border text-text-muted font-bold text-sm hover:bg-surface-alt transition-all active:scale-[0.98]"
                        >
                            ডিফল্টে রিসেট করো
                        </button>
                    </div>
                </div>

                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        প্রাইভেসি
                    </h3>
                    <div className="space-y-4">
                        {['show_in_leaderboard', 'show_question_insight'].map(field => (
                            <label key={field} className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-sm font-bold text-text">
                                        {field === 'show_in_leaderboard' ? 'লিডারবোর্ডে দেখাও' : 'প্রশ্ন ইনসাইট দেখাও'}
                                    </p>
                                    <p className="text-xs text-text-muted font-medium mt-0.5">
                                        {field === 'show_in_leaderboard'
                                            ? 'লিডারবোর্ডে তোমার নাম ও স্কোর অন্যদের থেকে লুকাও'
                                            : 'প্রশ্নের উত্তর দেওয়ার সময় "কত% সঠিক পেয়েছে" দেখাও'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateProfileFields({ [field]: !(profile as any)?.[field] } as any)}
                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                        (profile as any)?.[field] !== false ? 'bg-primary' : 'bg-wolf'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                        (profile as any)?.[field] !== false ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        ডেটা ব্যাকআপ
                    </h3>
                    <div className="space-y-3">
                        <p className="text-xs text-text-muted font-medium leading-relaxed">
                            তোমার সব প্রোগ্রেস, উত্তর ও সেটিংস লোকাল স্টোরেজে সেভ হয়। নিচের অপশনগুলো ব্যবহার করে ব্যাকআপ নিতে বা রিস্টোর করতে পারো।
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={exportData}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/10 transition-all active:scale-[0.98]"
                            >
                                <Download className="w-4 h-4" />
                                সব ডেটা এক্সপোর্ট করো
                            </button>
                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface border border text-text-muted font-bold text-sm hover:bg-surface-hover transition-all active:scale-[0.98] cursor-pointer">
                                <Upload className="w-4 h-4" />
                                ব্যাকআপ রিস্টোর করো
                                <input
                                    ref={importInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleImport}
                                />
                            </label>
                        </div>
                        {backupMessage && (
                            <div className={`p-3 rounded-xl flex items-center gap-2.5 border text-sm font-medium ${backupMessage.type === 'success'
                                ? 'bg-primary/5 border-primary/20 text-primary'
                                : backupMessage.type === 'error'
                                    ? 'bg-cardinal/5 border-cardinal/20 text-cardinal'
                                    : 'bg-bee/5 border-bee/20 text-bee'
                            }`}>
                                {backupMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                {backupMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
