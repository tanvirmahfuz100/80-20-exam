import React, { useState } from 'react';
import { Plus, Video, ClipboardList, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/localApi';

const Admin = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        instructor_name: '',
        exam_category: 'IBA',
        is_premium: false
    });

    const [videoData, setVideoData] = useState({
        title: '',
        video_url: ''
    });

    const [mockData, setMockData] = useState({
        title: '',
        duration_minutes: 60,
        total_questions: 50,
        exam_category: 'IBA',
        is_premium: false
    });

    const saveCourse = async () => {
        setLoading(true);
        const { error } = await api.addCourse(courseData);
        if (error) setMessage({ type: 'error', text: error.message || 'Failed to save course.' });
        else {
            setMessage({ type: 'success', text: 'Course saved locally.' });
            setCourseData({ title: '', description: '', instructor_name: '', exam_category: 'IBA', is_premium: false });
        }
        setLoading(false);
    };

    const saveVideo = async () => {
        setLoading(true);
        const { error } = await api.addVideo(videoData);
        if (error) setMessage({ type: 'error', text: error.message || 'Failed to save video.' });
        else {
            setMessage({ type: 'success', text: 'Video saved locally.' });
            setVideoData({ title: '', video_url: '' });
        }
        setLoading(false);
    };

    const saveMock = async () => {
        setLoading(true);
        const { error } = await api.addMockTest(mockData);
        if (error) setMessage({ type: 'error', text: error.message || 'Failed to save mock test.' });
        else {
            setMessage({ type: 'success', text: 'Mock test saved locally.' });
            setMockData({ title: '', duration_minutes: 60, total_questions: 50, exam_category: 'IBA', is_premium: false });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">
            <div>
                <h1 className="text-xl md:text-4xl font-black text-text tracking-tighter uppercase">Local Admin Studio</h1>
                <p className="text-text-dim font-bold uppercase tracking-widest text-[9px] md:text-[10px] mt-1 md:mt-2">Testing mode: all writes go to browser localStorage</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl md:rounded-2xl border flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-surface border rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-3 md:space-y-4">
                    <h2 className="text-text font-black uppercase tracking-widest text-xs flex items-center gap-2"><Plus className="w-4 h-4" /> Add Course</h2>
                    <input
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Course title"
                        value={courseData.title}
                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    />
                    <textarea
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Description"
                        rows={3}
                        value={courseData.description}
                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    />
                    <input
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Instructor"
                        value={courseData.instructor_name}
                        onChange={(e) => setCourseData({ ...courseData, instructor_name: e.target.value })}
                    />
                    <button
                        onClick={saveCourse}
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]"
                    >
                        Save Course
                    </button>
                </div>

                <div className="bg-surface border rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-3 md:space-y-4">
                    <h2 className="text-text font-black uppercase tracking-widest text-xs flex items-center gap-2"><Video className="w-4 h-4" /> Add Video</h2>
                    <input
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Video title"
                        value={videoData.title}
                        onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    />
                    <input
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Video URL"
                        value={videoData.video_url}
                        onChange={(e) => setVideoData({ ...videoData, video_url: e.target.value })}
                    />
                    <button
                        onClick={saveVideo}
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]"
                    >
                        Save Video
                    </button>
                </div>

                <div className="bg-surface border rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-3 md:space-y-4">
                    <h2 className="text-text font-black uppercase tracking-widest text-xs flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Add Mock Test</h2>
                    <input
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Mock title"
                        value={mockData.title}
                        onChange={(e) => setMockData({ ...mockData, title: e.target.value })}
                    />
                    <input
                        type="number"
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Duration"
                        value={mockData.duration_minutes}
                        onChange={(e) => setMockData({ ...mockData, duration_minutes: Number(e.target.value) })}
                    />
                    <input
                        type="number"
                        className="w-full bg-background border rounded-xl p-3 text-text text-sm"
                        placeholder="Questions"
                        value={mockData.total_questions}
                        onChange={(e) => setMockData({ ...mockData, total_questions: Number(e.target.value) })}
                    />
                    <button
                        onClick={saveMock}
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]"
                    >
                        Save Mock
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
