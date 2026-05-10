const STORAGE_KEYS = {
    profiles: 'exam_profiles',
    responses: 'exam_user_responses',
    courseProgress: 'exam_course_progress',
    mockResults: 'exam_mock_results',
    videos: 'exam_short_videos',
    videoEngagement: 'exam_video_engagement',
    subscriptions: 'exam_subscriptions',
    activityLogs: 'exam_activity_logs',
    reports: 'exam_reports',
    courses: 'exam_courses',
    mockTests: 'exam_mock_tests'
};

const defaultCourses = [
    {
        id: 'course_1',
        title: 'IBA Quant Foundations',
        description: 'Fast-track numbers, arithmetic, and logic shortcuts.',
        instructor_name: 'Team 80/20',
        exam_category: 'IBA',
        is_premium: false,
        cover_image_url: '',
        lessons: []
    },
    {
        id: 'course_2',
        title: 'BCS English Core',
        description: 'Grammar and vocabulary drills from past trends.',
        instructor_name: 'Team 80/20',
        exam_category: 'BCS',
        is_premium: false,
        cover_image_url: '',
        lessons: []
    }
];

const defaultMockTests = [
    {
        id: 'mock_1',
        title: 'IBA Full Mock 01',
        duration_minutes: 120,
        total_questions: 100,
        exam_category: 'IBA',
        is_premium: false
    },
    {
        id: 'mock_2',
        title: 'BCS Quick Mock 01',
        duration_minutes: 60,
        total_questions: 50,
        exam_category: 'BCS',
        is_premium: false
    }
];

const defaultVideos = [
    {
        id: 'v_1',
        title: 'Math Shortcut Sprint',
        video_url: 'https://cdn.pixabay.com/video/2021/04/12/70860-537443831_large.mp4',
        likes_count: 1240,
        saves_count: 450,
        created_at: new Date().toISOString()
    },
    {
        id: 'v_2',
        title: 'Vocabulary in 60 Seconds',
        video_url: 'https://cdn.pixabay.com/video/2020/07/28/45749-445851412_large.mp4',
        likes_count: 890,
        saves_count: 230,
        created_at: new Date().toISOString()
    }
];

const readStorage = (key, fallback = []) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const writeStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const ensureSeed = () => {
    if (!localStorage.getItem(STORAGE_KEYS.courses)) writeStorage(STORAGE_KEYS.courses, defaultCourses);
    if (!localStorage.getItem(STORAGE_KEYS.mockTests)) writeStorage(STORAGE_KEYS.mockTests, defaultMockTests);
    if (!localStorage.getItem(STORAGE_KEYS.videos)) writeStorage(STORAGE_KEYS.videos, defaultVideos);
};

ensureSeed();

const toQuestionRecord = (questionFile, chapter) => {
    const parts = (chapter?.file || '').split('/').filter(Boolean);
    const exam_category = (parts[0] || 'IBA').toUpperCase();
    const exam_type = chapter?.topic || chapter?.subject || 'General';

    return (questionFile.questions || []).map((q) => ({
        id: q.id,
        question_text: q.text,
        difficulty: q.difficulty || 'medium',
        exam_category,
        exam_type,
        options: (q.options || []).map((optionText, idx) => ({
            id: `${q.id}_${idx}`,
            option_text: optionText,
            is_correct: idx === q.correct
        })),
        source_tags: [questionFile.subject, questionFile.topic, questionFile.chapter].filter(Boolean)
    }));
};

const getAllJsonQuestions = async () => {
    const indexPaths = ['/iba/index.json', '/ssc/index.json'];
    const indexJsons = [];

    for (const p of indexPaths) {
        try {
            const res = await fetch(p);
            if (!res.ok) continue;
            const j = await res.json();
            indexJsons.push(j);
        } catch {
            // ignore
        }
    }

    const chapterFiles = [];
    for (const indexJson of indexJsons) {
        for (const subject of indexJson.subjects || []) {
            for (const topic of subject.topics || []) {
                for (const chapter of topic.chapters || []) {
                    chapterFiles.push({ file: chapter.file, subject: subject.name, topic: topic.name, chapter: chapter.name });
                }
            }
        }
    }

    const loadedSets = await Promise.all(
        chapterFiles.map(async (entry) => {
            try {
                const res = await fetch(entry.file);
                if (!res.ok) return [];
                const chapterJson = await res.json();
                return toQuestionRecord(chapterJson, entry);
            } catch {
                return [];
            }
        })
    );

    return loadedSets.flat();
};

export const api = {
    getProfile: async (userId) => {
        const profiles = readStorage(STORAGE_KEYS.profiles, []);
        const data = profiles.find((p) => p.id === userId) || null;
        return { data, error: null };
    },

    updateProfile: async (userId, updateData) => {
        const profiles = readStorage(STORAGE_KEYS.profiles, []);
        const idx = profiles.findIndex((p) => p.id === userId);

        if (idx >= 0) profiles[idx] = { ...profiles[idx], ...updateData };
        else profiles.push({ id: userId, ...updateData });

        writeStorage(STORAGE_KEYS.profiles, profiles);
        return { data: profiles[idx >= 0 ? idx : profiles.length - 1], error: null };
    },

    getCourses: async (category = null) => {
        const courses = readStorage(STORAGE_KEYS.courses, defaultCourses);
        const data = category ? courses.filter((c) => c.exam_category === category) : courses;
        return { data, error: null };
    },

    getLessonProgress: async (userId, lessonId) => {
        const rows = readStorage(STORAGE_KEYS.courseProgress, []);
        const data = rows.find((r) => r.user_id === userId && r.lesson_id === lessonId) || null;
        return { data, error: null };
    },

    updateLessonProgress: async (userId, lessonId, isCompleted) => {
        const rows = readStorage(STORAGE_KEYS.courseProgress, []);
        const idx = rows.findIndex((r) => r.user_id === userId && r.lesson_id === lessonId);
        const payload = { user_id: userId, lesson_id: lessonId, is_completed: isCompleted, last_watched_at: new Date().toISOString() };

        if (idx >= 0) rows[idx] = payload;
        else rows.push(payload);

        writeStorage(STORAGE_KEYS.courseProgress, rows);
        return { data: payload, error: null };
    },

    getQuestions: async (filters = {}) => {
        const all = await getAllJsonQuestions();

        let data = all;
        if (filters.category) data = data.filter((q) => q.exam_category === filters.category);
        if (filters.difficulty) data = data.filter((q) => q.difficulty === filters.difficulty);
        if (filters.type) data = data.filter((q) => q.exam_type === filters.type);

        return { data: data.slice(0, filters.limit || 50), error: null };
    },

    saveResponse: async (response) => {
        const rows = readStorage(STORAGE_KEYS.responses, []);
        rows.push({ ...response, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.responses, rows);
        return { data: true, error: null };
    },

    getUserStats: async (userId) => {
        const responses = readStorage(STORAGE_KEYS.responses, []).filter((r) => r.user_id === userId);
        const totalPracticed = responses.length;
        const correctOnes = responses.filter((r) => r.is_correct).length;
        const accuracy = totalPracticed > 0 ? (correctOnes / totalPracticed) * 100 : 0;
        const totalTime = responses.reduce((acc, curr) => acc + (curr.time_spent || 0), 0);

        return {
            data: {
                totalPracticed,
                accuracy: accuracy.toFixed(1),
                totalTimeInMinutes: Math.round(totalTime / 60),
                raw: responses
            },
            error: null
        };
    },

    getMockTests: async (category) => {
        const tests = readStorage(STORAGE_KEYS.mockTests, defaultMockTests);
        const data = category ? tests.filter((t) => t.exam_category === category) : tests;
        return { data, error: null };
    },

    getMockTestQuestions: async () => {
        const { data, error } = await api.getQuestions({ limit: 30 });
        if (error) return { data: [], error };

        const mockQuestions = data.map((q) => ({
            id: q.id,
            text: q.question_text,
            options: (q.options || []).map((o) => o.option_text),
            correct: (q.options || []).findIndex((o) => o.is_correct),
            difficulty: q.difficulty,
            explanation: 'Practice explanation from local JSON dataset.'
        }));

        return { data: mockQuestions, error: null };
    },

    saveMockTestResult: async (result) => {
        const rows = readStorage(STORAGE_KEYS.mockResults, []);
        rows.push({ ...result, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.mockResults, rows);
        return { data: true, error: null };
    },

    getShortVideos: async () => {
        const data = readStorage(STORAGE_KEYS.videos, defaultVideos).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return { data, error: null };
    },

    logEngagement: async (userId, videoId, action) => {
        const rows = readStorage(STORAGE_KEYS.videoEngagement, []);
        rows.push({ user_id: userId, video_id: videoId, action_type: action, created_at: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.videoEngagement, rows);

        const videos = readStorage(STORAGE_KEYS.videos, defaultVideos);
        const idx = videos.findIndex((v) => v.id === videoId);
        if (idx >= 0) {
            if (action === 'like') videos[idx].likes_count = (videos[idx].likes_count || 0) + 1;
            if (action === 'save') videos[idx].saves_count = (videos[idx].saves_count || 0) + 1;
            writeStorage(STORAGE_KEYS.videos, videos);
        }

        return { error: null };
    },

    getSubscription: async (userId) => {
        const subs = readStorage(STORAGE_KEYS.subscriptions, []);
        const data = subs.find((s) => s.user_id === userId) || { user_id: userId, plan_type: 'premium', status: 'active' };
        return { data, error: null };
    },

    logActivity: async (userId, type, details) => {
        const logs = readStorage(STORAGE_KEYS.activityLogs, []);
        logs.push({ id: crypto.randomUUID(), user_id: userId, activity_type: type, details, created_at: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.activityLogs, logs);
        return { error: null };
    },

    saveReport: async (report) => {
        const reports = readStorage(STORAGE_KEYS.reports, []);
        reports.push({ id: crypto.randomUUID(), ...report, created_at: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.reports, reports);
        return { data: true, error: null };
    },

    addCourse: async (course) => {
        const courses = readStorage(STORAGE_KEYS.courses, defaultCourses);
        const payload = { id: crypto.randomUUID(), ...course, lessons: course.lessons || [] };
        courses.push(payload);
        writeStorage(STORAGE_KEYS.courses, courses);
        return { data: payload, error: null };
    },

    addVideo: async (video) => {
        const videos = readStorage(STORAGE_KEYS.videos, defaultVideos);
        const payload = { id: crypto.randomUUID(), likes_count: 0, saves_count: 0, created_at: new Date().toISOString(), ...video };
        videos.unshift(payload);
        writeStorage(STORAGE_KEYS.videos, videos);
        return { data: payload, error: null };
    },

    addMockTest: async (mock) => {
        const mocks = readStorage(STORAGE_KEYS.mockTests, defaultMockTests);
        const payload = { id: crypto.randomUUID(), ...mock };
        mocks.push(payload);
        writeStorage(STORAGE_KEYS.mockTests, mocks);
        return { data: payload, error: null };
    }
};
