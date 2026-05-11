import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PracticeConfig from './pages/PracticeConfig';
import Quiz from './pages/Quiz';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import Courses from './pages/Courses';
import QuestionBank from './pages/QuestionBank';
import MockTests from './pages/MockTests';
import VideoFeed from './pages/VideoFeed';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import { api } from './services/api';

function App() {
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

const AppContent = () => {
  const location = useLocation();
  const { user, profile, updateProfileFields } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    if (user && profile && profile.question_version == null) {
      setShowLanguageModal(true);
    } else {
      setShowLanguageModal(false);
    }
  }, [user, profile]);

  const handleVersionSelect = async (version) => {
    if (!user) return;
    await api.updateProfile(user.id, { question_version: version });
    updateProfileFields({ question_version: version });
    setShowLanguageModal(false);
  };

  const VersionPrompt = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <div className="max-w-md w-full bg-background border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="space-y-4 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary/80">Choose your preferred question set</p>
          <h2 className="text-3xl font-black text-white">Select a language version</h2>
          <p className="text-sm text-white/60">You can switch this later in Settings.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          {['bangla', 'english'].map((version) => (
            <button
              key={version}
              type="button"
              onClick={() => handleVersionSelect(version)}
              className="rounded-3xl border border-white/10 bg-surface px-6 py-5 text-center text-white transition hover:border-primary/50 hover:bg-white/5"
            >
              <p className={`text-xl ${version === 'bangla' ? 'font-semibold bn-text' : 'font-bold'}`}>{version === 'bangla' ? 'বাংলা' : 'English'}</p>
              <p className="mt-3 text-sm text-white/50 tracking-tight">{version === 'bangla' ? 'Bangla question set' : 'English question set'}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {showLanguageModal && <VersionPrompt />}
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
            <motion.div {...pageMotion}>
              <Admin />
            </motion.div>
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
