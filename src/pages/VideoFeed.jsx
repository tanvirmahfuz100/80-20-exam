import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, MoreVertical, Music2, MessageSquare, Play, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VideoFeed = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            const { data } = await api.getShortVideos();
            setVideos(data || [
                { id: '1', title: 'IBA Math Shortcut #01', video_url: 'https://cdn.pixabay.com/video/2021/04/12/70860-537443831_large.mp4', likes_count: 1240, saves_count: 450, thumbnail_url: '' },
                { id: '2', title: 'English Vocabulary Hack', video_url: 'https://cdn.pixabay.com/video/2020/07/28/45749-445851412_large.mp4', likes_count: 890, saves_count: 230, thumbnail_url: '' }
            ]);
            setLoading(false);
        };
        fetchVideos();
    }, []);

    const handleAction = async (videoId, action) => {
        if (!user) return alert("Sign in to engage with videos!");
        await api.logEngagement(user.id, videoId, action);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto h-[calc(100vh-120px)] overflow-y-scroll no-scrollbar snap-y snap-mandatory bg-black rounded-[3rem] border border-white/5 shadow-2xl relative">
            {videos.map((vid) => (
                <div key={vid.id} className="h-full w-full snap-start relative group flex flex-col justify-end">
                    {/* Video Backing */}
                    <div className="absolute inset-0 z-0">
                        <video
                            src={vid.video_url}
                            className="w-full h-full object-cover"
                            loop
                            autoPlay
                            muted
                            playsInline
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                    </div>

                    {/* Interactions Overlay */}
                    <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-8 items-center text-white/80">
                        <button onClick={() => handleAction(vid.id, 'like')} className="group/btn flex flex-col items-center gap-1">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 hover:bg-red-500 hover:text-white transition-all transform group-active/btn:scale-125">
                                <Heart className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{vid.likes_count}</span>
                        </button>

                        <button onClick={() => handleAction(vid.id, 'save')} className="group/btn flex flex-col items-center gap-1">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 hover:bg-primary hover:text-white transition-all transform group-active/btn:scale-125">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{vid.saves_count}</span>
                        </button>

                        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 hover:bg-white/20 transition-all">
                            <Share2 className="w-6 h-6" />
                        </button>

                        <button className="p-1">
                            <MoreVertical className="w-5 h-5 opacity-40 hover:opacity-100" />
                        </button>
                    </div>

                    {/* Info Overlay */}
                    <div className="relative z-10 p-8 pb-12 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-black italic text-lg shadow-lg border-2 border-white/20">
                                80
                            </div>
                            <div>
                                <h4 className="text-white font-black italic tracking-tighter uppercase">80-20 ACADEMY</h4>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Follow for daily tips</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-white italic tracking-tight leading-tight uppercase">{vid.title}</h2>
                            <div className="flex items-center gap-2 text-white/40">
                                <Music2 className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-marquee whitespace-nowrap overflow-hidden">Brain Power - Original Lesson Audio</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {videos.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white/20">
                    <Play className="w-12 h-12 mb-4 opacity-5" />
                    <p className="font-black uppercase tracking-widest text-xs">No shorts in the feed yet!</p>
                </div>
            )}
        </div>
    );
};

export default VideoFeed;
