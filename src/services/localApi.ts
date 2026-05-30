/**
 * LOCAL STORAGE API (dev/prototype mode)
 * Mimics the Supabase client interface ({ data, error }) so that
 * pages and hooks call it the same way a real backend would be called.
 * To connect Supabase: create src/services/supabaseApi.js with the
 * same exported shape, then swap the import in each consumer.
 */
import { readStorage, writeStorage } from '../utils/storage';
import { resolveOptions, pickQuestionText, pickExplanation } from '../utils/normalizeQuestion';
import {
  getLevelProgress as _getLevelProgress,
  saveLevelProgress as _saveLevelProgress,
  addXp as _addXp,
  addStars as _addStars,
  getChallengeState as _getChallengeState,
  getDailyChallengesForExam as _getDailyChallengesForExam,
  getWeeklyChallengeForExam as _getWeeklyChallengeForExam,
  completeDailyChallengeById as _completeDailyChallengeById,
  advanceWeeklyChallenge as _advanceWeeklyChallenge
} from './levels';

const STORAGE_KEYS = {
    profiles: 'exam_profiles',
    responses: 'exam_user_responses',
    practiceSessions: 'exam_practice_sessions',
    courseProgress: 'exam_course_progress',
    mockResults: 'exam_mock_results',
    videos: 'exam_short_videos',
    videoEngagement: 'exam_video_engagement',
    subscriptions: 'exam_subscriptions',
    activityLogs: 'exam_activity_logs',
    reports: 'exam_reports',
    courses: 'exam_courses',
    mockTests: 'exam_mock_tests',
    bookmarks: 'exam_bookmarks'
};

const defaultCourses = [
    {
        id: 'course_1',
        title: 'IBA Quant Foundations',
        description: 'Fast-track numbers, arithmetic, and logic shortcuts.',
        instructor_name: 'Team Fireman',
        exam_category: 'IBA',
        is_premium: false,
        cover_image_url: '',
        lessons: []
    },
    {
        id: 'course_2',
        title: 'BCS English Core',
        description: 'Grammar and vocabulary drills from past trends.',
        instructor_name: 'Team Fireman',
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
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        likes_count: 1240,
        saves_count: 450,
        created_at: new Date().toISOString()
    },
    {
        id: 'v_2',
        title: 'Vocabulary in 60 Seconds',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        likes_count: 890,
        saves_count: 230,
        created_at: new Date().toISOString()
    }
];

const ensureSeed = () => {
    if (!localStorage.getItem(STORAGE_KEYS.courses)) writeStorage(STORAGE_KEYS.courses, defaultCourses);
    if (!localStorage.getItem(STORAGE_KEYS.mockTests)) writeStorage(STORAGE_KEYS.mockTests, defaultMockTests);
    if (!localStorage.getItem(STORAGE_KEYS.videos)) writeStorage(STORAGE_KEYS.videos, defaultVideos);
};

ensureSeed();

const flattenSetItems = (data) => {
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].items)) {
        return data.flatMap(set =>
            (set.items || []).map((item) => {
                const options = item.options || [];
                const correctAnswer = item.correct_answer || '';
                return {
                    id: item.id || `${set.id}_${item.item}`,
                    text: [item.context, item.question_text].filter(Boolean).join(' '),
                    options,
                    correct: options.indexOf(correctAnswer),
                    difficulty: 'medium',
                };
            })
        );
    }
    return null;
};

const toQuestionRecord = (questionFile: Record<string, unknown>, chapter?: { file?: string; topic?: string; subject?: string }) => {
    const parts = (chapter?.file || '').split('/').filter(Boolean);
    const exam_category = (parts[0] || 'IBA').toUpperCase();
    const exam_type = chapter?.topic || chapter?.subject || 'General';

    const sourceQuestions = Array.isArray(questionFile)
        ? questionFile
        : Array.isArray(questionFile.questions)
            ? questionFile.questions
            : Array.isArray(questionFile.passages)
                ? questionFile.passages
                : flattenSetItems(questionFile) || [];

    return sourceQuestions.map((q: Record<string, unknown>) => {
        const { options: resolvedOptions, correct } = resolveOptions(q as never);
        const optionLetters = ['A', 'B', 'C', 'D'];
        let optionTexts: string[];

        if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
            optionTexts = optionLetters.map((l) => (q.options as Record<string, string>)[l] || '');
        } else {
            optionTexts = resolvedOptions;
        }

        const correctIndex = correct >= 0 && correct < optionTexts.length ? correct : 0;

        return {
            id: q.id || q.question_id || q._id,
            question_text: pickQuestionText(q as never),
            difficulty: q.difficulty || 'medium',
            exam_category,
            exam_type,
            options: optionTexts.map((optionText: string, idx: number) => ({
                id: `${q.id || q.question_id || q._id || 'q'}_${idx}`,
                text: optionText,
                option_text: optionText,
                isCorrect: idx === correctIndex,
                is_correct: idx === correctIndex
            })),
            explanation_bn: q.explanation_bn || (q as Record<string, string>)['explanationBn'] || '',
            explanation_en: q.explanation_en || (q as Record<string, string>)['explanationEn'] || '',
            explanation: pickExplanation(q as never),
            source_tags: [questionFile.subject, questionFile.topic, questionFile.chapter].filter(Boolean)
        };
    });
};

const EXAM_INDEX_MAP: Record<string, string> = {
    'IBA': 'iba/index.json',
    'SSC': 'ssc/index.json',
    'HSC': 'hsc/index.json',
    'Class1-8': 'class7/index.json',
};

const getAllJsonQuestions = async (category?: string) => {
    const base = import.meta.env.BASE_URL || '/';
    const indexEntries = category
        ? [[category, EXAM_INDEX_MAP[category]]].filter(([_, p]) => p)
        : Object.entries(EXAM_INDEX_MAP);

    const chapterFiles: { file: string; subject: string; topic: string; chapter: string }[] = [];

    for (const [examName, indexPath] of indexEntries) {
        try {
            const res = await fetch(`${base}${indexPath}`);
            if (!res.ok) continue;
            const indexJson = await res.json();
            for (const subject of indexJson.subjects || []) {
                for (const topic of subject.topics || []) {
                    for (const chapter of topic.chapters || []) {
                        const chapterFile = chapter.file || chapter.file_bn || chapter.file_en;
                        if (chapterFile) {
                            chapterFiles.push({ file: chapterFile, subject: subject.name, topic: topic.name, chapter: chapter.name });
                        }
                    }
                }
            }
        } catch {
            // ignore
        }
    }

    if (chapterFiles.length === 0) return [];

    const loadedSets = await Promise.all(
        chapterFiles.map(async (entry) => {
            try {
                const path = entry.file.replace(/^\//, '');
                const res = await fetch(`${base}${path}`);
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

    getQuestions: async (filters: Record<string, string | number | undefined> = {}) => {
        const category = typeof filters.category === 'string' ? filters.category : undefined;
        const all = await getAllJsonQuestions(category);

        let data = all;
        if (category) data = data.filter((q) => q.exam_category === category);
        if (filters.difficulty) data = data.filter((q) => q.difficulty === filters.difficulty);
        if (filters.type) data = data.filter((q) => q.exam_type === filters.type);

        return { data: data.slice(0, (filters.limit as number) || 50), error: null };
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
        const wrongOnes = totalPracticed - correctOnes;
        const accuracy = totalPracticed > 0 ? (correctOnes / totalPracticed) * 100 : 0;
        const totalTime = responses.reduce((acc, curr) => acc + (curr.time_spent || 0), 0);

        return {
            data: {
                totalPracticed,
                correctOnes,
                wrongOnes,
                accuracy: accuracy.toFixed(1),
                totalTimeInMinutes: Math.round(totalTime / 60),
                raw: responses
            },
            error: null
        };
    },

    getUserResponses: async (userId) => {
        const responses = readStorage(STORAGE_KEYS.responses, [])
            .filter((r) => r.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return { data: responses, error: null };
    },

    savePracticeSession: async (session) => {
        const sessions = readStorage(STORAGE_KEYS.practiceSessions, []);
        sessions.push({ id: crypto.randomUUID(), ...session, created_at: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.practiceSessions, sessions);
        return { data: true, error: null };
    },

    getUserPracticeSessions: async (userId) => {
        const sessions = readStorage(STORAGE_KEYS.practiceSessions, [])
            .filter((s) => s.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return { data: sessions, error: null };
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
        const data = readStorage(STORAGE_KEYS.videos, defaultVideos).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    },

    getLevelProgress: async (userId, chapterId) => {
        return { data: _getLevelProgress(userId, chapterId), error: null };
    },

    saveLevelProgress: async (userId, chapterId, levelNumber, data) => {
        _saveLevelProgress(userId, chapterId, levelNumber, data);
        return { data: true, error: null };
    },

    addXp: async (userId, amount) => {
        return { data: _addXp(userId, amount), error: null };
    },

    addStars: async (userId, amount) => {
        return { data: _addStars(userId, amount), error: null };
    },

    getChallengeState: async () => {
        return { data: _getChallengeState(), error: null };
    },

    getDailyChallengesForExam: async (examId) => {
        return { data: _getDailyChallengesForExam(examId), error: null };
    },

    getWeeklyChallengeForExam: async (examId) => {
        return { data: _getWeeklyChallengeForExam(examId), error: null };
    },

    completeDailyChallengeById: async (userId, challengeId) => {
        _completeDailyChallengeById(userId, challengeId);
        return { data: true, error: null };
    },

    advanceWeeklyChallenge: async (userId, sectionId) => {
        _advanceWeeklyChallenge(userId, sectionId);
        return { data: true, error: null };
    },

    getLeaderboard: async (period = 'all-time') => {
        const profiles = readStorage(STORAGE_KEYS.profiles, []);
        const sessions = readStorage(STORAGE_KEYS.practiceSessions, []);
        const now = Date.now();
        const periodMs = period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : Infinity;

        const xpMap: Record<string, number> = {};
        for (const s of sessions) {
            if (periodMs !== Infinity && now - new Date(s.created_at).getTime() > periodMs) continue;
            const uid = s.user_id;
            xpMap[uid] = (xpMap[uid] || 0) + (s.correct_answers || 0) * 10;
        }

        const entries = Object.entries(xpMap)
            .map(([userId, xp]) => {
                const p = profiles.find(pr => pr.id === userId);
                return { userId, username: p?.username || 'Unknown', xp, avatar: undefined };
            })
            .filter(e => {
                const p = profiles.find(pr => pr.id === e.userId);
                return p?.show_in_leaderboard !== false;
            })
            .sort((a, b) => b.xp - a.xp);

        return { data: entries, error: null };
    },

    getQuestionStats: async (questionId) => {
        const responses = readStorage(STORAGE_KEYS.responses, [])
            .filter(r => String(r.question_id) === String(questionId));
        const total = responses.length;
        const correct = responses.filter(r => r.is_correct).length;
        return {
            data: { totalAttempts: total, correctCount: correct, accuracyPercent: total > 0 ? Math.round((correct / total) * 100) : 0 },
            error: null
        };
    },

    addBookmark: async (userId, questionId, sourceFile) => {
        const rows = readStorage(STORAGE_KEYS.bookmarks, []);
        const exists = rows.find(b => b.user_id === userId && String(b.question_id) === String(questionId));
        if (exists) return { data: exists, error: null };
        const bookmark = { id: crypto.randomUUID(), user_id: userId, question_id: String(questionId), source_file: sourceFile || '', created_at: new Date().toISOString() };
        rows.push(bookmark);
        writeStorage(STORAGE_KEYS.bookmarks, rows);
        return { data: bookmark, error: null };
    },

    removeBookmark: async (userId, questionId) => {
        let rows = readStorage(STORAGE_KEYS.bookmarks, []);
        rows = rows.filter(b => !(b.user_id === userId && String(b.question_id) === String(questionId)));
        writeStorage(STORAGE_KEYS.bookmarks, rows);
        return { data: true, error: null };
    },

    getBookmarks: async (userId) => {
        const rows = readStorage(STORAGE_KEYS.bookmarks, [])
            .filter(b => b.user_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { data: rows, error: null };
    },

    isBookmarked: async (userId, questionId) => {
        const rows = readStorage(STORAGE_KEYS.bookmarks, []);
        const exists = !!rows.find(b => b.user_id === userId && String(b.question_id) === String(questionId));
        return { data: exists, error: null };
    }
};
