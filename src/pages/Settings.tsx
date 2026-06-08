import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/LoadingScreen';
import {
    User, Mail, Phone, GraduationCap, CheckCircle2,
    Save, AlertCircle, Loader2, ShieldCheck, Sun, Moon,
    BookOpen, Bell, Globe, Lock, Palette, Layout, Monitor,
    Volume2, VolumeX, Music, Clock,
    Download, Upload, Database,
} from 'lucide-react';
import { useHomepageLayout } from '../hooks/useHomepageLayout';
import { ALL_CARDS, HOMEPAGE_CARD_META } from '../types/homepage';
import { useSoundStore, PACK_SOUND_KEYS, SOUND_DISPLAY_NAMES } from '../stores/soundStore';
import { playSound } from '../utils/sounds';
import { readStorage, writeStorage } from '../utils/storage';

const LBO_OPT_OUT_KEY = 'exam_leaderboard_opt_out';

interface LeaderboardOptOut {
    until: string | null;
    startedAt: string;
}

const loadLeaderboardOptOut = (): LeaderboardOptOut | null => {
    return readStorage<LeaderboardOptOut | null>(LBO_OPT_OUT_KEY, null);
};

const saveLeaderboardOptOut = (opt: LeaderboardOptOut | null) => {
    writeStorage(LBO_OPT_OUT_KEY, opt);
};

const isOptedOut = (opt: LeaderboardOptOut | null): boolean => {
    if (!opt) return false;
    if (opt.until === null) return true;
    return Date.now() < new Date(opt.until).getTime();
};

const Settings = () => {
    const { user, profile, loading: authLoading, updateProfileFields } = useAuth();
    const { theme, setTheme, isDark, fontSize, setFontSize, customFontSize, setCustomFontSize } = useTheme();
    const { isCardActive, toggleCard, resetToDefault } = useHomepageLayout();

    const globalMute = useSoundStore((s) => s.globalMute);
    const toggleGlobalMute = useSoundStore((s) => s.toggleGlobalMute);
    const activePackId = useSoundStore((s) => s.activePackId);
    const setActivePack = useSoundStore((s) => s.setActivePack);
    const setSoundEnabled = useSoundStore((s) => s.setSoundEnabled);
    const setSoundVolume = useSoundStore((s) => s.setSoundVolume);
    const getSetting = useSoundStore((s) => s.getSetting);
    const resetSound = useSoundStore((s) => s.resetSound);
    const resetAllToPack = useSoundStore((s) => s.resetAllToPack);
    const getPacks = useSoundStore((s) => s.getPacks);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        username: '',
        phone_number: '',
        target_exams: [],
        question_version: 'bangla',
    });

    const [notificationEnabled, setNotificationEnabled] = useState(() => {
        return readStorage<boolean>('exam_notification_enabled', false);
    });
    const [notificationTime, setNotificationTime] = useState(() => {
        return readStorage<string>('exam_notification_time', '09:00');
    });

    const [leaderboardOptOut, setLeaderboardOptOut] = useState<LeaderboardOptOut | null>(() => loadLeaderboardOptOut());
    const [lbDurationType, setLbDurationType] = useState<'days' | 'weeks' | 'indefinite' | null>(null);
    const [lbDurationValue, setLbDurationValue] = useState(1);

    const [customFontInput, setCustomFontInput] = useState(customFontSize);

    const examOptions = [
        "IBA", "BCS", "Bank & Jobs", "Medical", "Engineering", "Chartered Accountancy",
    ];

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || user?.user_metadata?.username || '',
                phone_number: profile.phone_number || '',
                target_exams: profile.target_exams || [],
                question_version: profile.question_version || 'bangla',
            });
        }
    }, [profile, user]);

    useEffect(() => {
        const opt = loadLeaderboardOptOut();
        if (opt && opt.until !== null && Date.now() >= new Date(opt.until).getTime()) {
            saveLeaderboardOptOut(null);
            setLeaderboardOptOut(null);
            updateProfileFields({ show_in_leaderboard: true } as any);
        }
    }, []);

    const toggleExam = (exam) => {
        const current = formData.target_exams;
        if (current.includes(exam)) {
            setFormData({ ...formData, target_exams: current.filter((e) => e !== exam) });
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
                updated_at: new Date().toISOString(),
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
                const data = JSON.parse(event.target.result as string);
                let count = 0;
                for (const [key, value] of Object.entries(data)) {
                    if (APP_KEYS.includes(key)) {
                        try {
                            localStorage.setItem(key, JSON.stringify(value));
                            count++;
                        } catch {}
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

    const handleNotificationToggle = () => {
        const next = !notificationEnabled;
        setNotificationEnabled(next);
        writeStorage('exam_notification_enabled', next);
    };

    const handleNotificationTimeChange = (t: string) => {
        setNotificationTime(t);
        writeStorage('exam_notification_time', t);
    };

    const handleLeaderboardToggle = (visible: boolean) => {
        if (visible) {
            saveLeaderboardOptOut(null);
            setLeaderboardOptOut(null);
            updateProfileFields({ show_in_leaderboard: true } as any);
        } else {
            const opt: LeaderboardOptOut = { until: null, startedAt: new Date().toISOString() };
            saveLeaderboardOptOut(opt);
            setLeaderboardOptOut(opt);
            setLbDurationType('indefinite');
            updateProfileFields({ show_in_leaderboard: false } as any);
        }
    };

    const handleLeaderboardDuration = () => {
        if (!lbDurationType) return;
        let until: string | null;
        if (lbDurationType === 'indefinite') {
            until = null;
        } else {
            const ms = lbDurationType === 'days' ? lbDurationValue * 86400000 : lbDurationValue * 604800000;
            until = new Date(Date.now() + ms).toISOString();
        }
        const opt: LeaderboardOptOut = { until, startedAt: new Date().toISOString() };
        saveLeaderboardOptOut(opt);
        setLeaderboardOptOut(opt);
        updateProfileFields({ show_in_leaderboard: false } as any);
    };

    const testSound = (key: string) => {
        playSound(key);
    };

    if (authLoading) return <LoadingScreen message="সেটিংস লোড হচ্ছে..." />;

    const optedOut = isOptedOut(leaderboardOptOut);

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
                {/* ── পরিচয় ── */}
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

                {/* ── স্টাডি ট্র্যাক ── */}
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

                {/* ── অ্যাপিয়ারেন্স ── */}
                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                        অ্যাপিয়ারেন্স
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-1 bn-text">থিম</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                        theme === 'dark' ? 'bg-primary/5 border-primary' : 'bg-surface border'
                                    }`}
                                >
                                    <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-primary' : 'text-text-muted'}`} />
                                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-primary' : 'text-text'}`}>ডার্ক</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                        theme === 'light' ? 'bg-primary/5 border-primary' : 'bg-surface border'
                                    }`}
                                >
                                    <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === 'light' ? 'text-primary' : 'text-text-muted'}`} />
                                    <p className={`text-sm font-bold ${theme === 'light' ? 'text-primary' : 'text-text'}`}>লাইট</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('system')}
                                    className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                        theme === 'system' ? 'bg-primary/5 border-primary' : 'bg-surface border'
                                    }`}
                                >
                                    <Monitor className={`w-6 h-6 mx-auto mb-2 ${theme === 'system' ? 'text-primary' : 'text-text-muted'}`} />
                                    <p className={`text-sm font-bold ${theme === 'system' ? 'text-primary' : 'text-text'}`}>সিস্টেম</p>
                                </button>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-1 bn-text">টেক্সট সাইজ</p>
                            <div className="flex gap-2 mb-3">
                                {['small', 'normal', 'large'].map((sz) => (
                                    <button
                                        key={sz}
                                        type="button"
                                        onClick={() => { setFontSize(sz); setCustomFontInput(''); }}
                                        className={`flex-1 p-3 rounded-full border text-center text-sm font-bold transition-all ${
                                            fontSize === sz && !customFontSize ? 'bg-primary text-white border-primary' : 'bg-surface border text-text-muted'
                                        }`}
                                    >
                                        {sz === 'small' ? 'ছোট' : sz === 'normal' ? 'নরমাল' : 'বড়'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted shrink-0 bn-text">কাস্টম</span>
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="number"
                                        min="10"
                                        max="32"
                                        value={customFontInput}
                                        onChange={(e) => setCustomFontInput(e.target.value)}
                                        placeholder="px"
                                        className="duo-input w-20 text-center"
                                    />
                                    <span className="text-xs text-text-muted font-medium">px</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customFontInput && !isNaN(Number(customFontInput))) {
                                                setCustomFontSize(customFontInput);
                                            }
                                        }}
                                        className="px-3 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95"
                                    >
                                        প্রয়োগ করো
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── সাউন্ড ── */}
                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        সাউন্ড
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-text">গ্লোবাল মিউট</p>
                                <p className="text-xs text-text-muted font-medium mt-0.5">সমস্ত সাউন্ড বন্ধ করো</p>
                            </div>
                            <button
                                onClick={toggleGlobalMute}
                                className={`relative w-12 h-6 rounded-full transition-all ${!globalMute ? 'bg-primary' : 'bg-wolf'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!globalMute ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-1 bn-text">সাউন্ড প্যাক</p>
                            <div className="flex gap-2">
                                {getPacks().map((pack) => (
                                    <button
                                        key={pack.id}
                                        onClick={() => setActivePack(pack.id)}
                                        className={`flex-1 p-3 rounded-xl border text-center transition-all active:scale-[0.98] ${
                                            activePackId === pack.id
                                                ? 'bg-primary/5 border-primary/20 text-primary'
                                                : 'bg-surface border text-text-muted hover:border hover:text-text'
                                        }`}
                                    >
                                        <p className="text-sm font-bold">{pack.name}</p>
                                        <p className="text-[10px] text-text-muted mt-0.5">{pack.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1 bn-text">পার-অ্যাকশন সাউন্ড</p>
                                <button
                                    onClick={resetAllToPack}
                                    className="text-[10px] text-primary font-bold hover:underline"
                                >
                                    রিসেট করো
                                </button>
                            </div>
                            <div className="space-y-2">
                                {PACK_SOUND_KEYS.map((key) => {
                                    const setting = getSetting(key);
                                    return (
                                        <div key={key} className="p-3 rounded-xl border border bg-surface">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSoundEnabled(key, !setting.enabled);
                                                            if (!setting.enabled) testSound(key);
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-all ${
                                                            setting.enabled ? 'text-primary' : 'text-text-muted'
                                                        }`}
                                                    >
                                                        {setting.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                                    </button>
                                                    <span className="text-sm font-bold text-text">{SOUND_DISPLAY_NAMES[key]}</span>
                                                </div>
                                                <button
                                                    onClick={() => testSound(key)}
                                                    className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold hover:bg-primary/20 transition-all active:scale-95"
                                                >
                                                    টেস্ট
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3 pl-9">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={setting.volume}
                                                    onChange={(e) => setSoundVolume(key, Number(e.target.value))}
                                                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-wolf accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                                />
                                                <span className="text-[10px] font-bold text-text-muted w-7 text-right">{setting.volume}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── নোটিফিকেশন ── */}
                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        নোটিফিকেশন
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-text">দৈনিক রিমাইন্ডার</p>
                                <p className="text-xs text-text-muted font-medium mt-0.5">প্রতিদিন নির্দিষ্ট সময়ে পড়ার কথা মনে করিয়ে দেবে</p>
                            </div>
                            <button
                                onClick={handleNotificationToggle}
                                className={`relative w-12 h-6 rounded-full transition-all ${notificationEnabled ? 'bg-primary' : 'bg-wolf'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        {notificationEnabled && (
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-text-muted shrink-0" />
                                <input
                                    type="time"
                                    value={notificationTime}
                                    onChange={(e) => handleNotificationTimeChange(e.target.value)}
                                    className="duo-input flex-1"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── হোমপেজ লেআউট ── */}
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

                {/* ── প্রাইভেসি ── */}
                <div className="bg-surface border border rounded-2xl p-5">
                    <h3 className="font-black text-sm text-text mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        প্রাইভেসি
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-bold text-text">লিডারবোর্ডে দেখাও</p>
                                    <p className="text-xs text-text-muted font-medium mt-0.5">
                                        {optedOut
                                            ? 'তোমার নাম ও স্কোর অন্যদের থেকে লুকানো আছে। এক্সপি জমা হতে থাকবে।'
                                            : 'লিডারবোর্ডে তোমার নাম ও স্কোর অন্যদের দেখাবে'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleLeaderboardToggle(optedOut)}
                                    className={`relative w-12 h-6 rounded-full transition-all ${!optedOut ? 'bg-primary' : 'bg-wolf'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!optedOut ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            {optedOut && (
                                <div className="space-y-3 pt-3 border-t border">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted bn-text">
                                        কতদিন লুকিয়ে থাকবে?
                                    </p>
                                    <div className="flex gap-2">
                                        {([
                                            { key: 'days', label: 'দিন' },
                                            { key: 'weeks', label: 'সপ্তাহ' },
                                            { key: 'indefinite', label: 'অনির্দিষ্ট' },
                                        ] as const).map((opt) => (
                                            <button
                                                key={opt.key}
                                                onClick={() => setLbDurationType(opt.key)}
                                                className={`flex-1 px-3 py-2.5 rounded-full border text-center text-sm font-bold transition-all active:scale-[0.98] ${
                                                    lbDurationType === opt.key
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-surface border text-text-muted hover:border hover:text-text'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    {lbDurationType && lbDurationType !== 'indefinite' && (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={lbDurationValue}
                                                onChange={(e) => setLbDurationValue(Math.max(1, Number(e.target.value)))}
                                                className="duo-input w-20 text-center"
                                            />
                                            <span className="text-sm text-text-muted font-medium">
                                                {lbDurationType === 'days' ? 'দিন' : 'সপ্তাহ'}
                                            </span>
                                            <button
                                                onClick={handleLeaderboardDuration}
                                                className="ml-auto px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95"
                                            >
                                                সেট করো
                                            </button>
                                        </div>
                                    )}
                                    {lbDurationType === 'indefinite' && (
                                        <p className="text-[11px] text-text-muted font-medium">
                                            তুমি যতক্ষণ না চাও, ততক্ষণ লিডারবোর্ড থেকে লুকানো থাকবে।
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-text">প্রশ্ন ইনসাইট দেখাও</p>
                                <p className="text-xs text-text-muted font-medium mt-0.5">
                                    প্রশ্নের উত্তর দেওয়ার সময় "কত% সঠিক পেয়েছে" দেখাও
                                </p>
                            </div>
                            <button
                                onClick={() => updateProfileFields({ show_question_insight: !(profile as any)?.show_question_insight } as any)}
                                className={`relative w-12 h-6 rounded-full transition-all ${
                                    (profile as any)?.show_question_insight !== false ? 'bg-primary' : 'bg-wolf'
                                }`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    (profile as any)?.show_question_insight !== false ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </label>
                    </div>
                </div>

                {/* ── ডেটা ব্যাকআপ ── */}
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
