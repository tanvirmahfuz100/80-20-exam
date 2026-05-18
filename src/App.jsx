import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PracticeConfig from './pages/PracticeConfig';
import Quiz from './pages/Quiz';
import LevelSelect from './pages/LevelSelect';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Courses from './pages/Courses';
import QuestionBank from './pages/QuestionBank';
import MockTests from './pages/MockTests';
import VideoFeed from './pages/VideoFeed';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Stars from './pages/Stars';
import { useLowEndDevice } from './hooks';
import { api } from './services/api';
import { Graduation } from './components/Illustrations';
import { playSound, preloadSounds } from './utils/sounds';

function App() {
  useLowEndDevice();
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
};

const OnboardingModal = ({ onComplete }) => {
  const { user, profile, updateProfileFields } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(profile?.username || user?.user_metadata?.username || '');
  const [version, setVersion] = useState('bangla');
  const { setTheme, setFontSize } = useTheme();
  const [themeChoice, setThemeChoice] = useState(profile?.theme || 'dark');
  const [fontSizeChoice, setFontSizeChoice] = useState(profile?.fontSize || 'normal');
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    const name = username.trim() || 'Student';
    updateProfileFields({ username: name, question_version: version, theme: themeChoice, fontSize: fontSizeChoice });
    // persist to profiles store as well
    await api.updateProfile(user.id, { username: name, question_version: version, theme: themeChoice, fontSize: fontSizeChoice });
    // apply theme + font size immediately
    try { setTheme(themeChoice); } catch {}
    try { setFontSize(fontSizeChoice); } catch {}
    setSaving(false);
    onComplete();
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-4">
      <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-2xl max-h-[90dvh] overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center opacity-10">
                <Graduation className="w-16 h-16 md:w-24 md:h-24" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Welcome to 80/20 Exam!</h2>
                <p className="text-white/50 text-xs md:text-sm mt-1 md:mt-2 font-medium leading-relaxed">
                  Your personal exam prep platform. Practice questions, watch lessons, take mock tests, and track your progress — all in one place.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 px-1">What should we call you?</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-background border border-white/10 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl text-white font-medium text-sm outline-none focus:border-primary/50 transition-all"
                autoFocus
              />
              <p className="text-[9px] md:text-[10px] text-white/20 px-1">You can change this later in Settings.</p>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border border-white/10 transition-all"
              >
                Skip
              </button>
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 md:py-4 bg-primary hover:bg-primary-hover text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-[0.98]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Choose your language</h2>
              <p className="text-white/50 text-xs md:text-sm font-medium">
                Questions will be shown in your preferred language. You can switch anytime in Settings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { id: 'bangla', label: 'বাংলা', desc: 'Bangla medium question set' },
                { id: 'english', label: 'English', desc: 'English medium question set' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVersion(opt.id)}
                  className={`rounded-xl md:rounded-2xl border px-4 md:px-6 py-4 md:py-6 text-center transition-all ${
                    version === opt.id
                      ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className={`text-xl md:text-2xl font-black text-white`}>{opt.label}</p>
                  <p className="mt-1 md:mt-2 text-[10px] md:text-xs text-white/40 font-medium">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-wider text-white/40 mb-2">Theme</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeChoice('dark')}
                    className={`flex-1 rounded-xl py-2 ${themeChoice === 'dark' ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}>
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeChoice('light')}
                    className={`flex-1 rounded-xl py-2 ${themeChoice === 'light' ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}>
                    Light
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-wider text-white/40 mb-2">Text Size</p>
                <div className="flex gap-2">
                  {['small','normal','large'].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSizeChoice(sz)}
                      className={`flex-1 rounded-xl py-2 ${fontSizeChoice === sz ? 'bg-primary/15 border-primary' : 'bg-white/5 border-white/10'}`}>
                      {sz === 'small' ? 'Small' : sz === 'normal' ? 'Normal' : 'Large'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-3 md:py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {saving ? 'Setting up...' : 'Start Learning'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const { role } = useAuth();
  if (allowedRole && role !== 'super_admin' && role !== 'content_admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { setTheme, setFontSize } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const prevPathRef = React.useRef(location.pathname);

  useEffect(() => {
    preloadSounds();
  }, []);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      playSound('interface');
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user && profile) {
      const needsOnboarding = profile.question_version == null;
      setShowOnboarding(needsOnboarding);
    } else {
      setShowOnboarding(false);
    }
  }, [user, profile]);

  // Apply saved appearance settings from profile (if present)
  useEffect(() => {
    if (!profile) return;
    try {
      if (profile.theme) setTheme(profile.theme);
    } catch {}
    try {
      if (profile.fontSize) setFontSize(profile.fontSize);
    } catch {}
  }, [profile, setTheme, setFontSize]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <Layout>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={
            <motion.div {...pageMotion}>
              <Login />
            </motion.div>
          } />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/" element={
            <motion.div {...pageMotion}>
              <Dashboard />
            </motion.div>
          } />

          <Route path="/courses" element={
            <motion.div {...pageMotion}>
              <Courses />
            </motion.div>
          } />
          <Route path="/practice" element={
            <motion.div {...pageMotion}>
              <PracticeConfig />
            </motion.div>
          } />
          <Route path="/stars" element={
            <motion.div {...pageMotion}>
              <Stars />
            </motion.div>
          } />
          <Route path="/bank" element={
            <motion.div {...pageMotion}>
              <QuestionBank />
            </motion.div>
          } />
          <Route path="/mock-tests" element={
            <motion.div {...pageMotion}>
              <MockTests />
            </motion.div>
          } />
          <Route path="/shorts" element={
            <motion.div {...pageMotion}>
              <VideoFeed />
            </motion.div>
          } />
          <Route path="/levels" element={
            <motion.div {...pageMotion}>
              <LevelSelect />
            </motion.div>
          } />
          <Route path="/quiz/:chapterId" element={
            <motion.div {...pageMotion}>
              <Quiz />
            </motion.div>
          } />

          <Route path="/analytics" element={
            <motion.div {...pageMotion}>
              <Analytics />
            </motion.div>
          } />
          <Route path="/settings" element={
            <motion.div {...pageMotion}>
              <Settings />
            </motion.div>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <motion.div {...pageMotion}>
                <Admin />
              </motion.div>
            </ProtectedRoute>
          } />

          <Route path="/welcome" element={
            <motion.div {...pageMotion}>
              <Landing />
            </motion.div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
