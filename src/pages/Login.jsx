import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { StudyDesk, Graduation } from '../components/Illustrations';

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
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md space-y-6 md:space-y-8 p-6 md:p-10 bg-surface border border-white/5 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative text-center space-y-4">
                    <div className="flex justify-center opacity-[0.06] pointer-events-none">
                        <Graduation className="w-24 h-24 md:w-32 md:h-32" />
                    </div>
                    <div className="relative">
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-1">Welcome Back!</h2>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] md:text-xs">Local testing mode with full access enabled</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 relative">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in zoom-in-95">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-3 md:space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl md:rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium text-sm"
                                placeholder="Email Address"
                            />
                        </div>

                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] px-1">
                            Enter any email and continue. Registration is hidden during testing.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 md:py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                        Continue to App
                    </button>

                    <div className="text-center">
                        <p className="text-white/30 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                            All features are unlocked for testing.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
