import React from 'react';
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
  useAuth();

  return (
    <Layout>
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
