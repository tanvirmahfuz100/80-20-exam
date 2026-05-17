import React, { useState } from 'react';
import { X, Send, Camera, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

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
            const { error } = await supabase.from('reports').insert([{
                user_id: user?.id,
                email: user?.email || 'guest@anonymous.com',
                subject: formData.subject,
                description: formData.description,
                image_url: formData.image_url
            }]);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 p-10 md:p-14 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Incident <span className="text-primary not-italic">REPORT</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">Personnel Communication Terminal</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {success ? (
                        <div className="py-20 text-center space-y-6 animate-in zoom-in-50 duration-500">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Transmission Successful</h3>
                                <p className="text-white/30 text-xs font-medium uppercase tracking-widest text-balance">Personnel will review your report shortly.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Class of Issue</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-background border border-white/5 p-4 rounded-2xl text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none"
                                >
                                    <option>General Inquiry</option>
                                    <option>Technical Anomaly</option>
                                    <option>Question Content Error</option>
                                    <option>Account Access Limitation</option>
                                    <option>Premium Pathway Inquiry</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Detailed Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-background border border-white/5 p-5 rounded-2xl text-white font-medium min-h-[150px] outline-none focus:border-primary/50 transition-all text-sm leading-relaxed"
                                    placeholder="Provide comprehensive details for analysis..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Evidence Link (Image URL)</label>
                                <div className="relative group">
                                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-background border border-white/5 py-4 pl-12 pr-4 rounded-2xl text-white font-medium outline-none focus:border-primary/50 transition-all text-xs"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                Initiate Transmission
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
