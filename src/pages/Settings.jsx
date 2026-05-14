import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
    User, Mail, Phone, GraduationCap, CheckCircle2,
    Save, AlertCircle, Loader2, ShieldCheck
} from 'lucide-react';
import { StudyDesk } from '../components/Illustrations';

const Settings = () => {
    const { user, profile, loading: authLoading, updateProfileFields } = useAuth();
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
                updated_at: new Date().toISOString()
            });

            if (!error) {
                updateProfileFields({ question_version: formData.question_version });
            }

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error("Update error:", err);
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase mb-1">Profile Studio</h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Customize your learning experience</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl md:rounded-2xl flex items-center gap-3 border animate-in zoom-in-95 ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden group">
                    <div className="relative">
                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight uppercase mb-6 md:mb-8 flex items-center gap-3">
                            <User className="text-primary w-5 h-5" />
                            Identity
                        </h3>

                        <div className="space-y-4 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-background border border-white/5 pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Email Address (Locked)</label>
                                <div className="relative opacity-50">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full bg-background border border-white/5 pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl text-white font-medium text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="tel"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full bg-background border border-white/5 pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden group">
                    <div className="relative space-y-6 md:space-y-8">
                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                            <GraduationCap className="text-emerald-500 w-5 h-5" />
                            Study Tracks
                        </h3>

                        <div className="grid grid-cols-1 gap-2 md:gap-3">
                            {examOptions.map((exam) => (
                                <button
                                    key={exam}
                                    onClick={() => toggleExam(exam)}
                                    className={`p-3 md:p-4 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${formData.target_exams.includes(exam)
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/5'
                                            : 'bg-background border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xs font-bold">{exam}</span>
                                    {formData.target_exams.includes(exam) && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Question Language</h4>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {['bangla', 'english'].map((version) => (
                                    <button
                                        key={version}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, question_version: version })}
                                        className={`px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border text-left uppercase text-[10px] font-black transition-all active:scale-[0.98] ${formData.question_version === version
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-background border-white/5 text-white/50 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {version === 'bangla' ? 'Bangla' : 'English'}
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
