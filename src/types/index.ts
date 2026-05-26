// ── User & Auth ──
export interface User {
  id: string;
  email: string;
  user_metadata: { username?: string; [key: string]: unknown };
}

export interface Profile {
  id: string;
  username: string;
  role: 'student' | 'super_admin' | 'content_admin';
  plan_type: string;
  total_xp: number;
  total_stars?: number;
  target_exams: string[];
  question_version: string | null;
  phone_number?: string;
  theme?: string;
  fontSize?: string;
  gems?: number;
  streak?: number;
}

export interface AuthSession {
  user: User;
  profile: Profile;
}

// ── Question Data ──
export interface RawOption {
  id?: string;
  text?: string;
  option_text?: string;
  isCorrect?: boolean;
  is_correct?: boolean;
  explanationBn?: string;
  explanationEn?: string;
}

export interface RawQuestion {
  id?: string | number;
  question_id?: string | number;
  _id?: string | number;
  text?: string;
  question?: string;
  statement?: string;
  stem?: string;
  passage_text?: string;
  title?: string;
  difficulty?: string;
  options?: Record<string, string> | RawOption[] | string[];
  answer?: string;
  correct?: number;
  correct_answer?: string;
  correct_tag?: string;
  explanation_bn?: string;
  explanationEn?: string;
  explanation_en?: string;
  explanation?: string;
  source?: string;
  year?: string;
  _type?: string;
  context?: string;
  question_text?: string;
  items?: RawQuestion[];
  passage?: string;
  blankId?: string;
  boxWords?: string[];
  uuid?: string;
}

export interface NormalizedOption {
  id: string;
  text: string;
  option_text: string;
  isCorrect: boolean;
  is_correct: boolean;
  explanationBn?: string;
  explanationEn?: string;
}

export interface Question {
  id: string | number;
  question_text: string;
  text: string;
  difficulty: string;
  exam_category: string;
  exam_type: string;
  options: NormalizedOption[];
  correct: number;
  explanation_bn: string;
  explanation_en: string;
  explanation: string;
  source_tags: string[];
  _mistakeId?: string;
  passage?: string;
  blankId?: string;
  boxWords?: string[];
  uuid?: string;
  source?: string;
  year?: string;
  _type?: string;
}

// ── Quiz ──
export interface ShuffledOption {
  text: string;
  originalIdx: number;
}

export interface GapFillBlank {
  blankId: string;
  id: string;
  questionId: string | number;
  correct: string;
  correct_answer: string;
  explanation_bn: string;
  explanation_en: string;
  options: NormalizedOption[];
  correctText: string;
}

export interface GapFillGroup {
  passage: string;
  boxWords: string[];
  difficulty: string;
  blanks: GapFillBlank[];
  startIndex: number;
  endIndex: number;
}

export interface QuizResult {
  id: string | number;
  isCorrect: boolean;
  selected: number;
  selectedOriginalIdx: number;
  time_spent: number;
}

export interface FlyingStar {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// ── Levels ──
export interface Level {
  levelNumber: number;
  questions: Question[];
  type: 'single' | 'passage' | 'mixed' | 'creative_question';
  passageCount?: number;
}

export interface LevelProgressData {
  completed?: boolean;
  accuracy?: number;
  xpEarned?: number;
  starsEarned?: number;
}

export interface LevelProgress {
  levels: Record<string, LevelProgressData>;
}

// ── Review / Mistakes ──
export interface MistakeSource {
  file?: string;
  title?: string;
  chapterId?: string;
}

export interface Mistake {
  id: string;
  question: Question;
  stage: number;
  nextReviewAt: string;
  lastWrongAt: string;
  source: MistakeSource;
}

export interface MistakeGroup {
  stage: number;
  label: string;
  desc: string;
  days: number;
  total: number;
  dueNow: number;
  mistakes: Mistake[];
}

export interface ReviewInterval {
  days: number;
  label: string;
  desc: string;
}

// ── Challenges ──
export interface DailyChallenge {
  date: string;
  id: string;
  label: string;
  file: string;
  chapterId: string;
  levelNumber: number;
  completed: boolean;
  bonusXp: number;
}

export interface WeeklyChallenge {
  weekStart: string;
  examId: string;
  label: string;
  totalLevels: number;
  completedLevels: string[];
  completed: boolean;
  bonusXp: number;
}

export interface ChallengeState {
  daily: DailyChallenge[];
  weekly: WeeklyChallenge | null;
}

// ── Practice / History ──
export interface PracticeSession {
  id?: string;
  user_id: string;
  chapter_id: string;
  chapter_title: string;
  source_file: string | null;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy: number;
  mode: string;
  created_at?: string;
}

export interface UserStats {
  totalPracticed: number;
  correctOnes: number;
  wrongOnes: number;
  accuracy: string;
  totalTimeInMinutes: number;
  raw: QuizResponse[];
}

export interface QuizResponse {
  id?: string;
  user_id: string;
  question_id: string | number | null;
  chapter_id: string | null;
  chapter_title: string | null;
  source_file: string | null;
  question_text: string | null;
  selected_option_index: number;
  selected_option_text: string | null;
  correct_option_index: number;
  correct_option_text: string | null;
  is_correct: boolean;
  time_spent: number;
  status: string;
  created_at?: string;
}

// ── API Response shape (mimics Supabase) ──
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// ── Exam Config ──
export type Exam = 'SSC' | 'HSC' | 'BCS' | 'IBA' | 'Class1-8';
export type Group = 'Science' | 'Business' | 'Arts';
export type Medium = 'Bangla' | 'English';

export interface ExamSection {
  label: string;
  file: string;
  chapterId: string;
}

// ── Courses / Mock Tests / Videos ──
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  exam_category: string;
  is_premium: boolean;
  cover_image_url: string;
  lessons: unknown[];
}

export interface MockTest {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  exam_category: string;
  is_premium: boolean;
}

export interface ShortVideo {
  id: string;
  title: string;
  video_url: string;
  likes_count: number;
  saves_count: number;
  created_at: string;
}

// ── Sound ──
export type SoundName = 'correctAnswer' | 'star' | 'levelUp' | 'bonus' | 'interface' | 'notification' | 'rank' | 'time';

// ── Storage ──
export interface StorageKeys {
  profiles: string;
  responses: string;
  practiceSessions: string;
  courseProgress: string;
  mockResults: string;
  videos: string;
  videoEngagement: string;
  subscriptions: string;
  activityLogs: string;
  reports: string;
  courses: string;
  mockTests: string;
}

// ── Streak ──
export interface StreakEntry {
  date: string;
  completed: boolean;
  xpEarned: number;
}

export interface StreakHistoryData {
  entries: StreakEntry[];
  currentStreak: number;
}

// ── Theme Context ──
export type Theme = 'dark' | 'light';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

// ── Question Bank ──
export interface QuestionFilter {
  category?: string;
  difficulty?: string;
  type?: string;
  limit?: number;
  search?: string;
}

// ── Report ──
export interface ReportConfig {
  whatsappNumber: string;
}

// ── Quiz Session State ──
export interface QuizSessionState {
  questions: Question[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  selectedOption: number | null;
  isAnswered: boolean;
  score: number;
  isFinished: boolean;
  results: QuizResult[];
  mistakeCount: number;
  flyingStars: FlyingStar[];
  balanceGlow: boolean;
  elapsed: number;
  wrongAttempts: number;
  currentLevel: number | null;
  levelSessionSaved: boolean;
  historicalAnswered: number;
  totalQuestionCount: number;
  quizFontSize: number;
}
