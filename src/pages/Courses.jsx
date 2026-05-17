import React, { useState, useEffect } from 'react';
import { Play, Lock, Clock, User, CheckCircle, Search } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
    const { user, profile } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await api.getCourses();
            setCourses(data || []);
            setLoading(false);
        };
        fetchCourses();
    }, []);

    const categories = ['All', 'IBA', 'BCS', 'Bank', 'Medical', 'Engineering'];

    const filteredCourses = filter === 'All'
        ? courses
        : courses.filter(c => c.exam_category === filter);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Loading Courses...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-4">
                        MASTER <span className="text-primary not-italic uppercase">EVERYTHING.</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">
                        Video lessons from the best instructors
                    </p>
                </div>

                {/* Categories */}
                <div className="bg-surface border border-white/5 p-1.5 rounded-2xl flex gap-1 shadow-2xl overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filter === cat ? 'bg-primary text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                    <div key={course.id} className="bg-surface border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all shadow-2xl flex flex-col">
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={course.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                            {course.is_premium && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    Premium
                                </div>
                            )}
                        </div>

                        <div className="p-8 flex-1 flex flex-col space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                <span>{course.exam_category}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                <span>{course.lessons?.length || 0} Lessons</span>
                            </div>

                            <h3 className="text-2xl font-black text-white italic tracking-tight group-hover:text-primary transition-colors leading-tight">
                                {course.title}
                            </h3>

                            <p className="text-white/40 text-xs font-medium leading-relaxed line-clamp-2">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                    <User className="w-4 h-4 text-white/20" />
                                </div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    {course.instructor_name}
                                </span>
                            </div>

                            <button
                                disabled={course.is_premium && profile?.plan_type !== 'premium'}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${course.is_premium && profile?.plan_type !== 'premium'
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/20 active:scale-95'
                                    }`}
                            >
                                {course.is_premium && profile?.plan_type !== 'premium' ? (
                                    <><Lock className="w-4 h-4" /> Go Premium to Unlock</>
                                ) : (
                                    <><Play className="w-4 h-4 fill-current" /> Start Learning</>
                                )}
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <p className="text-white/10 font-black uppercase tracking-widest">More Courses Coming Soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
