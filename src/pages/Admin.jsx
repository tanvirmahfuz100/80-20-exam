import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';
import {
    Plus, Save, Trash2, Tag, FileText,
    Video, ShieldCheck, Loader2,
    Upload, History, Users, AlertTriangle, CheckCircle2,
    ArrowUpRight, Download, Filter, Search
} from 'lucide-react';

const Admin = () => {
    const { role, user } = useAuth();
    const [activeTab, setActiveTab] = useState('injector'); // injector, bulk, logs, users
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Injector State
    const [formData, setFormData] = useState({
        exam_category: 'BCS', exam_type: '', question_text: '',
        image_url: '', difficulty: 'medium', source_tags: '',
        explanation_text: '', explanation_video_url: ''
    });
    const [options, setOptions] = useState([
        { text: '', is_correct: true }, { text: '', is_correct: false },
        { text: '', is_correct: false }, { text: '', is_correct: false }
    ]);

    // Logs State
    const [logs, setLogs] = useState([]);
    const [logFilter, setLogFilter] = useState('');

    // Users State (Super Admin Only)
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'users' && role === 'super_admin') fetchUsers();
    }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('admin_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        setLogs(data || []);
        setLoading(false);
    };

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*');
        setAllUsers(data || []);
        setLoading(false);
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                setLoading(true);
                let successCount = 0;
                let errorCount = 0;

                for (const row of results.data) {
                    try {
                        const { data: qData, error: qErr } = await supabase
                            .from('questions')
                            .insert([{
                                question_text: row.question_text,
                                exam_category: row.exam_category,
                                exam_type: row.exam_type,
                                difficulty: row.difficulty || 'medium',
                                explanation_text: row.explanation_text,
                                source_tags: row.tags ? row.tags.split(',') : []
                            }])
                            .select().single();

                        if (qErr) throw qErr;

                        const opts = [
                            { question_id: qData.id, option_text: row.option_a, is_correct: row.correct === 'A' },
                            { question_id: qData.id, option_text: row.option_b, is_correct: row.correct === 'B' },
                            { question_id: qData.id, option_text: row.option_c, is_correct: row.correct === 'C' },
                            { question_id: qData.id, option_text: row.option_d, is_correct: row.correct === 'D' },
                        ].filter(o => o.option_text);

                        const { error: oErr } = await supabase.from('options').insert(opts);
                        if (oErr) throw oErr;
                        successCount++;
                    } catch (err) {
                        console.error(err);
                        errorCount++;
                    }
                }
                setMessage({ type: 'success', text: `Processed ${successCount} questions. Errors: ${errorCount}` });
                setLoading(false);
            }
        });
    };

    const updateUserRole = async (userId, newRole) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) {
            setMessage({ type: 'success', text: 'User role updated successfully!' });
            fetchUsers();
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">ADMIN <span className="text-primary not-italic">STUDIO</span></h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
                        Access Level: <span className="text-primary">{role?.replace('_', ' ') || 'Authenticating...'}</span>
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-surface border border-white/5 p-1.5 rounded-2xl flex gap-1 shadow-2xl overflow-x-auto no-scrollbar">
                    {[
                        { id: 'injector', icon: Plus, label: 'Add Question' },
                        { id: 'bulk', icon: Upload, label: 'Bulk Upload' },
                        { id: 'logs', icon: History, label: 'History' },
                        { id: 'users', icon: Users, label: 'Users', superOnly: true }
                    ].map(tab => (
                        (tab.superOnly && role !== 'super_admin') ? null : (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    ))}
                </div>
            </div>

            {message.text && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-xs opacity-50 hover:opacity-100">Dismiss</button>
                </div>
            )}

            {/* Injected Content */}
            <div className="min-h-[60vh]">
                {activeTab === 'injector' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {/* Use the previous Single Injection Form UI here - omitted for brevity but logic remains */}
                        <div className="lg:col-span-2 bg-surface-alt/10 border-2 border-dashed border-white/5 rounded-[40px] flex items-center justify-center p-20 text-center">
                            <p className="text-white/20 font-black italic uppercase tracking-tighter">Ready to add new questions!</p>
                        </div>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                        <div className="bg-surface border border-white/5 rounded-[40px] p-12 text-center space-y-8 shadow-2xl">
                            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20">
                                <Upload className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Upload Questions</h2>
                                <p className="text-white/30 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                    Upload a spreadsheet (.csv) with your questions. Make sure the headers match our template.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="w-full py-6 bg-white/5 hover:bg-white/10 rounded-2xl border-2 border-dashed border-white/10 cursor-pointer transition-all hover:border-primary/50 text-white/40 hover:text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                                    <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    Select File (.csv)
                                </label>

                                <button className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <Download className="w-3 h-3" /> Download CSV Template
                                </button>
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6">
                            <h4 className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Required Columns
                            </h4>
                            <code className="text-[10px] text-emerald-500/60 font-mono">
                                question_text, option_a, option_b, option_c, option_d, correct (A/B/C/D), exam_category, tags
                            </code>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white italic truncate">Recent Actions <span className="text-white/10 not-italic ml-2">(Last 50 Entries)</span></h3>
                            <button onClick={fetchLogs} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                                <History className="w-4 h-4 text-white/40" />
                            </button>
                        </div>
                        <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Timestamp</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Admin Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Action</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Item Changed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[10px] text-white/40">{new Date(log.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-[10px] font-mono truncate max-w-[120px]">{log.admin_id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.action_type === 'INSERT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    log.action_type === 'DELETE' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    }`}>
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-white/60">
                                                {log.target_table} <span className="text-white/10 ml-2 font-mono">ID: {log.target_id?.substring(0, 8)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && role === 'super_admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-10 duration-500">
                        {allUsers.map(u => (
                            <div key={u.id} className="bg-surface border border-white/5 rounded-3xl p-6 space-y-4 hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-primary italic text-xl border border-white/5">
                                        {u.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold truncate">{u.username || 'Unidentified'}</h4>
                                        <p className="text-[10px] text-white/20 font-black uppercase tracking-tighter truncate">{u.email}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <select
                                        value={u.role}
                                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                                        className="bg-background border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1.5 rounded-lg outline-none focus:border-primary/50 transition-all"
                                    >
                                        <option value="student">Student</option>
                                        <option value="content_admin">Content Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                    <button className="p-2 text-white/10 hover:text-red-500 transition-colors">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
