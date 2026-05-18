import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, MoreVertical, Music2, Play } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

const VideoFeed = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            const { data } = await api.getShortVideos();
            setVideos(data || [
                { id: '1', title: 'IBA Math Shortcut #01', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', likes_count: 1240, saves_count: 450, thumbnail_url: '' },
                { id: '2', title: 'English Vocabulary Hack', video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', likes_count: 890, saves_count: 230, thumbnail_url: '' }
            ]);
            setLoading(false);
        };
        fetchVideos();
    }, []);

    const handleAction = async (videoId, action) => {
        if (!user) return alert("Sign in to engage with videos!");
        await api.logEngagement(user.id, videoId, action);
    };

    if (loading) return <LoadingScreen message="Loading videos..." />;

    return (
        <div className="max-w-md mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] overflow-y-scroll no-scrollbar snap-y snap-mandatory bg-black rounded-2xl md:rounded-[3rem] border border-white/5 shadow-lg relative">
            {videos.map((vid) => (
                <div key={vid.id} className="h-full w-full snap-start relative group flex flex-col justify-end">
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

                    <div className="absolute right-3 md:right-4 bottom-24 md:bottom-32 z-20 flex flex-col gap-5 md:gap-8 items-center text-white/80">
                        <button onClick={() => handleAction(vid.id, 'like')} className="group/btn flex flex-col items-center gap-1">
                            <div className="p-2.5 md:p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 hover:bg-red-500 hover:text-white transition-all transform group-active/btn:scale-125">
                                <Heart className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{vid.likes_count}</span>
                        </button>

                        <button onClick={() => handleAction(vid.id, 'save')} className="group/btn flex flex-col items-center gap-1">
                            <div className="p-2.5 md:p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 hover:bg-primary hover:text-white transition-all transform group-active/btn:scale-125">
                                <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{vid.saves_count}</span>
                        </button>

                        <button className="p-2.5 md:p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/5 hover:bg-white/20 transition-all">
                            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        <button className="p-1">
                            <MoreVertical className="w-4 h-5 md:w-5 opacity-40 hover:opacity-100" />
                        </button>
                    </div>

                    <div className="relative z-10 p-5 md:p-8 pb-8 md:pb-12 space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center font-black text-base md:text-lg shadow-lg border-2 border-white/20">
                                80
                            </div>
                            <div>
                                <h4 className="text-white font-black tracking-tighter uppercase text-xs md:text-sm">80-20 ACADEMY</h4>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Follow for daily tips</p>
                            </div>
                        </div>

                        <div className="space-y-1 md:space-y-2">
                            <h2 className="text-base md:text-xl font-black text-white tracking-tight leading-tight uppercase">{vid.title}</h2>
                            <div className="flex items-center gap-2 text-white/40">
                                <Music2 className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">Brain Power - Original Lesson Audio</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {videos.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white/20">
                    <Play className="w-10 h-12 md:w-12 mb-4 opacity-5" />
                    <p className="font-black uppercase tracking-widest text-xs">No shorts in the feed yet!</p>
                </div>
            )}
        </div>
    );
};

export default VideoFeed;
