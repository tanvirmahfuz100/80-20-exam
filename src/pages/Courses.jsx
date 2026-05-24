import React, { useState, useEffect } from 'react';
import { Play, Lock, User } from 'lucide-react';
import { api } from '../services/localApi';
import { useAuth } from '../context/AuthContext';
import { Books } from '../components/Illustrations';
import LottieAnimation from '../components/LottieAnimation';
import booksAnimation from '../assets/books.json';
import LoadingScreen from '../components/LoadingScreen';

const Courses = () => {
    const { profile } = useAuth();
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

    if (loading) return <LoadingScreen message="Loading Courses..." />;

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
            <div className="relative overflow-hidden rounded-3xl bg-surface p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
                <div className="absolute -bottom-8 -right-8 w-44 h-44 opacity-[0.06] pointer-events-none">
                    <LottieAnimation src={booksAnimation} className="w-full h-full" pingPong />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-3 md:mb-4">
                        MASTER <span className="text-primary uppercase">EVERYTHING.</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">
                        Video lessons from the best instructors
                    </p>
                </div>

                <div className="bg-surface border border-white/5 p-1 rounded-xl md:rounded-2xl flex gap-1 shadow-lg overflow-x-auto no-scrollbar -mx-4 md:mx-0 px-4 md:px-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filter === cat ? 'bg-primary text-white shadow-lg' : 'text-white/20 hover:text-white/40'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                    <div key={course.id} className="bg-surface border border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all shadow-lg flex flex-col">
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={course.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                            {course.is_premium && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-reward text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    Premium
                                </div>
                            )}
                        </div>

                        <div className="p-4 md:p-8 flex-1 flex flex-col space-y-3 md:space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                                <span>{course.exam_category}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                <span>{course.lessons?.length || 0} Lessons</span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-primary transition-colors leading-tight">
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
                                className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${course.is_premium && profile?.plan_type !== 'premium'
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary-hover text-white'
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
                    <div className="col-span-full py-16 md:py-20 text-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-[3rem] flex flex-col items-center gap-4">
                        <div className="w-20 h-20 md:w-28 md:h-28 opacity-30">
                            <LottieAnimation src={booksAnimation} className="w-full h-full" pingPong />
                        </div>
                        <p className="text-white/10 font-black uppercase tracking-widest">More Courses Coming Soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
