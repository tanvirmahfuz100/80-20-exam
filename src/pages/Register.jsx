import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, AlertCircle, Loader2, User } from 'lucide-react';

const Register = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Supabase usually requires email confirmation if enabled
            alert("Check your email for confirmation link!");
            navigate('/login');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md space-y-8 p-10 bg-surface border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>

                <div className="relative text-center">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">Join the Club!</h2>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Create a profile to access 50,000+ questions</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in zoom-in-95">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="Display Name"
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="Password (Min 6 chars)"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        Create Account
                    </button>

                    <div className="text-center pt-4">
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                            Already have an account? <Link to="/login" className="text-primary hover:underline ml-2">Sign In</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
