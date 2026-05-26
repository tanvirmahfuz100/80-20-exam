import React, { useState } from 'react';
import { X, Send, Camera, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/localApi';

const ReportModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        subject: 'General Inquiry',
        description: '',
        image_url: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await api.saveReport({
                user_id: user?.id,
                email: user?.email || 'guest@anonymous.com',
                subject: formData.subject,
                description: formData.description,
                image_url: formData.image_url
            });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ subject: 'General Inquiry', description: '', image_url: '' });
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl bg-surface border rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 p-10 md:p-14 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-text italic tracking-tighter uppercase bn-text">সমস্যা <span className="text-primary not-italic">রিপোর্ট</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mt-1 bn-text">পার্সোনেল কমিউনিকেশন টার্মিনাল</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-text-dim hover:text-text transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {success ? (
                        <div className="py-20 text-center space-y-6 animate-in zoom-in-50 duration-500">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-text italic uppercase tracking-tighter bn-text">রিপোর্ট পাঠানো হয়েছে</h3>
                                <p className="text-text-muted text-xs font-medium uppercase tracking-widest text-balance bn-text">আমাদের টিম শীঘ্রই রিপোর্ট রিভিউ করবে।</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bn-text">ইস্যুর ধরন</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-background border p-4 rounded-2xl text-text font-bold outline-none focus:border-primary/50 transition-all appearance-none"
                                >
                                    <option>জেনারেল ইনকোয়ারি</option>
                                    <option>টেকনিক্যাল সমস্যা</option>
                                    <option>প্রশ্নের কন্টেন্টে ভুল</option>
                                    <option>অ্যাকাউন্ট অ্যাক্সেস সমস্যা</option>
                                    <option>প্রিমিয়াম পাথওয়ে ইনকোয়ারি</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bn-text">বিস্তারিত বিবরণ</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-background border p-5 rounded-2xl text-text font-medium min-h-[150px] outline-none focus:border-primary/50 transition-all text-sm leading-relaxed"
                                    placeholder="বিস্তারিত লিখুন..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bn-text">প্রমাণ লিংক (ইমেজ ইউআরএল)</label>
                                <div className="relative group">
                                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-background border py-4 pl-12 pr-4 rounded-2xl text-text font-medium outline-none focus:border-primary/50 transition-all text-xs"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 group border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] bn-text"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                রিপোর্ট পাঠাও
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
