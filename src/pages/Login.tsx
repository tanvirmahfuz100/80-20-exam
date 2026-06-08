import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, LogIn, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await signIn({ email });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center w-full px-4">
            <div className="w-full max-w-sm space-y-6 p-6 md:p-8 bg-surface border rounded-3xl shadow-lg">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl border-2 border-primary/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text tracking-tight bn-text">স্বাগতম!</h2>
                        <p className="text-sm text-text-muted font-medium mt-1">লোকাল টেস্টিং মোড - সব ফিচার ওপেন</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3.5 bg-cardinal/5 border border-cardinal/20 rounded-2xl flex items-center gap-2.5 text-cardinal text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hare" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="duo-input !pl-10"
                                placeholder="ইমেইল ঠিকানা"
                            />
                        </div>
                        <p className="text-[10px] text-hare font-medium px-1">
                            যেকোনো ইমেইল দিয়ে চালিয়ে যাও। টেস্টিংয়ের সময় রেজিস্ট্রেশন লুকানো আছে।
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.97] shadow-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                        অ্যাপে যাও
                    </button>

                    <p className="text-center text-[10px] text-hare font-medium">
                        টেস্টিংয়ের জন্য সব ফিচার আনলক করা আছে।
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
