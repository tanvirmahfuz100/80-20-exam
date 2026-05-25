import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/LoadingScreen';
import {
    User, Mail, Phone, GraduationCap, CheckCircle2,
    Save, AlertCircle, Loader2, ShieldCheck, Sun, Moon,
    BookOpen, Bell, Globe, Lock, Palette
} from 'lucide-react';

const Settings = () => {
    const { user, profile, loading: authLoading, updateProfileFields } = useAuth();
    const { theme, setTheme, isDark, fontSize, setFontSize } = useTheme();
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

    if (authLoading) return <LoadingScreen message="সেটিংস লোড হচ্ছে..." />;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-black text-charcoal">সেটিংস</h1>
                    <p className="text-sm text-hare font-medium mt-0.5">তোমার লার্নিং এক্সপিরিয়েন্স কাস্টমাইজ করো</p>
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
                <div className="bg-white border border-wolf rounded-2xl p-5">
                    <h3 className="font-black text-sm text-charcoal mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        পরিচয়
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-hare px-1">নাম</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hare" />
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
                            <label className="text-[10px] font-bold uppercase tracking-wider text-hare px-1">ইমেইল</label>
                            <div className="relative opacity-60">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hare" />
                                <input type="email" value={user?.email} disabled className="duo-input pl-10 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-hare px-1">ফোন নম্বর</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hare" />
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

                <div className="bg-white border border-wolf rounded-2xl p-5">
                    <h3 className="font-black text-sm text-charcoal mb-4 flex items-center gap-2">
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
                                        : 'bg-white border-wolf text-hare hover:border-hare hover:text-charcoal'
                                }`}
                            >
                                <span className="text-sm font-bold">{exam}</span>
                                {formData.target_exams.includes(exam) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-hare px-1">প্রশ্নের ভাষা</p>
                        <div className="flex gap-2">
                            {['bangla', 'english'].map((version) => (
                                <button
                                    key={version}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, question_version: version })}
                                    className={`flex-1 px-4 py-3 rounded-full border text-sm font-bold transition-all active:scale-[0.98] ${
                                        formData.question_version === version
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white border-wolf text-hare hover:border-hare hover:text-charcoal'
                                    }`}
                                >
                                    {version === 'bangla' ? 'বাংলা' : 'ইংরেজি'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-wolf rounded-2xl p-5">
                    <h3 className="font-black text-sm text-charcoal mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-primary" />
                        অ্যাপিয়ারেন্স
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setTheme('dark')}
                                className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                    isDark ? 'bg-primary/5 border-primary' : 'bg-white border-wolf'
                                }`}
                            >
                                <Moon className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-primary' : 'text-hare'}`} />
                                <p className={`text-sm font-bold ${isDark ? 'text-primary' : 'text-charcoal'}`}>ডার্ক</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme('light')}
                                className={`flex-1 p-4 rounded-2xl border text-center transition-all active:scale-[0.98] ${
                                    !isDark ? 'bg-primary/5 border-primary' : 'bg-white border-wolf'
                                }`}
                            >
                                <Sun className={`w-6 h-6 mx-auto mb-2 ${!isDark ? 'text-primary' : 'text-hare'}`} />
                                <p className={`text-sm font-bold ${!isDark ? 'text-primary' : 'text-charcoal'}`}>লাইট</p>
                            </button>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-hare mb-2">টেক্সট সাইজ</p>
                            <div className="flex gap-2">
                                {['small', 'normal', 'large'].map((sz) => (
                                    <button
                                        key={sz}
                                        type="button"
                                        onClick={() => setFontSize(sz)}
                                        className={`flex-1 p-3 rounded-full border text-center text-sm font-bold transition-all ${
                                            fontSize === sz ? 'bg-primary text-white border-primary' : 'bg-white border-wolf text-hare'
                                        }`}
                                    >
                                        {sz === 'small' ? 'ছোট' : sz === 'normal' ? 'নরমাল' : 'বড়'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
