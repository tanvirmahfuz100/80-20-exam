import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, AlertCircle, Loader2, User, Phone, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedExams, setSelectedExams] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const examOptions = [
        "IBA", "BCS", "Bank & Jobs", "Medical", "Engineering", "Chartered Accountancy"
    ];

    const toggleExam = (exam) => {
        if (selectedExams.includes(exam)) {
            setSelectedExams(selectedExams.filter(e => e !== exam));
        } else {
            setSelectedExams([...selectedExams, exam]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedExams.length === 0) {
            setError("Please select at least one target exam.");
            return;
        }
        setLoading(true);
        setError(null);

        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    phone_number: phoneNumber,
                    target_exams: selectedExams
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            alert("Success! Check your email for a confirmation link to start learning.");
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen py-20 flex items-center justify-center px-6">
            <div className="w-full max-w-xl space-y-8 p-10 bg-surface border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>

                <div className="relative text-center">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">Join the Club!</h2>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-xs">Create your profile to access 50,000+ questions</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8 relative">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium animate-in fade-in zoom-in-95">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="Full Name"
                            />
                        </div>

                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-background border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all font-medium"
                                placeholder="Phone Number"
                            />
                        </div>

                        <div className="relative group md:col-span-2">
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

                        <div className="relative group md:col-span-2">
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

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-2">What are you studying for? (Select all that apply)</p>
                        <div className="grid grid-cols-2 gap-3">
                            {examOptions.map((exam) => (
                                <button
                                    key={exam}
                                    type="button"
                                    onClick={() => toggleExam(exam)}
                                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedExams.includes(exam)
                                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                                        : 'bg-background border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xs font-bold">{exam}</span>
                                    {selectedExams.includes(exam) && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        Create Free Account
                    </button>

                    <div className="text-center">
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
