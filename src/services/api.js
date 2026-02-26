import { supabase } from '../supabase';

export const api = {
    // 🏠 Profiles & Auth
    getProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    updateProfile: async (userId, updateData) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);
        return { data, error };
    },

    // 📚 Courses & Lessons
    getCourses: async (category = null) => {
        let query = supabase.from('courses').select('*, lessons(*)');
        if (category) query = query.eq('exam_category', category);
        const { data, error } = await query;
        return { data, error };
    },

    getLessonProgress: async (userId, lessonId) => {
        const { data, error } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single();
        return { data, error };
    },

    updateLessonProgress: async (userId, lessonId, isCompleted) => {
        const { data, error } = await supabase
            .from('course_progress')
            .upsert({ user_id: userId, lesson_id: lessonId, is_completed: isCompleted, last_watched_at: new Date() });
        return { data, error };
    },

    // ❓ Question Bank
    getQuestions: async (filters = {}) => {
        let query = supabase.from('questions').select('*, options(*)');
        if (filters.category) query = query.eq('exam_category', filters.category);
        if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
        if (filters.type) query = query.eq('exam_type', filters.type);

        const { data, error } = await query.limit(filters.limit || 50);
        return { data, error };
    },

    saveResponse: async (response) => {
        const { data, error } = await supabase
            .from('user_responses')
            .insert([response]);
        return { data, error };
    },

    // 📊 Analytics & Dashboard
    getUserStats: async (userId) => {
        const { data: responses, error } = await supabase
            .from('user_responses')
            .select('*')
            .eq('user_id', userId);

        if (error) return { error };

        const totalPracticed = responses.length;
        const correctOnes = responses.filter(r => r.is_correct).length;
        const accuracy = totalPracticed > 0 ? (correctOnes / totalPracticed) * 100 : 0;
        const totalTime = responses.reduce((acc, curr) => acc + (curr.time_spent || 0), 0);

        return {
            data: {
                totalPracticed,
                accuracy: accuracy.toFixed(1),
                totalTimeInMinutes: Math.round(totalTime / 60),
                raw: responses
            }
        };
    },

    // ⏱️ Mock Tests
    getMockTests: async (category) => {
        const { data, error } = await supabase
            .from('mock_tests')
            .select('*')
            .eq('exam_category', category);
        return { data, error };
    },

    getMockTestWithQuestions: async (testId) => {
        const { data, error } = await supabase
            .from('mock_tests')
            .select('*, mock_test_questions(questions(*, options(*)))')
            .eq('id', testId)
            .single();
        return { data, error };
    },

    saveMockTestResult: async (result) => {
        const { data, error } = await supabase
            .from('mock_test_results')
            .insert([result]);
        return { data, error };
    },

    // 🎬 Short Videos
    getShortVideos: async () => {
        const { data, error } = await supabase
            .from('short_videos')
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    },

    logEngagement: async (userId, videoId, action) => {
        const { error } = await supabase
            .from('video_engagement')
            .upsert({ user_id: userId, video_id: videoId, action_type: action });
        return { error };
    },

    // 💳 Subscriptions
    getSubscription: async (userId) => {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();
        return { data, error };
    },

    // 📝 Activity Logs (ML Readiness)
    logActivity: async (userId, type, details) => {
        const { error } = await supabase
            .from('activity_logs')
            .insert([{ user_id: userId, activity_type: type, details }]);
        return { error };
    }
};
