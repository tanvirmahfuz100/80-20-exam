import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLowEndDevice } from './hooks';
import { playSound, preloadSounds } from './utils/sounds';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PracticeConfig = React.lazy(() => import('./pages/PracticeConfig'));
const Quiz = React.lazy(() => import('./pages/Quiz'));
const LevelSelect = React.lazy(() => import('./pages/LevelSelect'));
const Login = React.lazy(() => import('./pages/Login'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Courses = React.lazy(() => import('./pages/Courses'));
const QuestionBank = React.lazy(() => import('./pages/QuestionBank'));
const MockTests = React.lazy(() => import('./pages/MockTests'));
const VideoFeed = React.lazy(() => import('./pages/VideoFeed'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Landing = React.lazy(() => import('./pages/Landing'));
const Stars = React.lazy(() => import('./pages/Stars'));
const CreativeQuestionView = React.lazy(() => import('./pages/CreativeQuestionView'));
const SubjectSelection = React.lazy(() => import('./pages/SubjectSelection'));
const Learn = React.lazy(() => import('./pages/Learn'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Quests = React.lazy(() => import('./pages/Quests'));
const Shop = React.lazy(() => import('./pages/Shop'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Help = React.lazy(() => import('./pages/Help'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const ProtectedRoute = ({ children, allowedRole }) => {
  const { role } = useAuth();
  if (allowedRole && role !== 'super_admin' && role !== 'content_admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const { setTheme, setFontSize } = useTheme();
  const prevPathRef = React.useRef(location.pathname);
  const { isLowEnd } = useLowEndDevice();

  const pageMotion = isLowEnd
    ? { initial: {}, animate: {}, exit: {}, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } };

  useEffect(() => {
    preloadSounds();
  }, []);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      playSound('interface');
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

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

  return (
    <Layout>
      <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={
              <motion.div {...pageMotion}>
                <Login />
              </motion.div>
            } />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={
              <motion.div {...pageMotion}>
                <Dashboard />
              </motion.div>
            } />
            <Route path="/" element={
              <motion.div {...pageMotion}>
                <Learn />
              </motion.div>
            } />
            <Route path="/learn" element={
              <motion.div {...pageMotion}>
                <Learn />
              </motion.div>
            } />
            <Route path="/leaderboard" element={
              <motion.div {...pageMotion}>
                <Leaderboard />
              </motion.div>
            } />
            <Route path="/quests" element={
              <motion.div {...pageMotion}>
                <Quests />
              </motion.div>
            } />
            <Route path="/shop" element={
              <motion.div {...pageMotion}>
                <Shop />
              </motion.div>
            } />
            <Route path="/profile" element={
              <motion.div {...pageMotion}>
                <Profile />
              </motion.div>
            } />
            <Route path="/help" element={
              <motion.div {...pageMotion}>
                <Help />
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

            <Route path="/creative-view" element={
              <motion.div {...pageMotion}>
                <CreativeQuestionView />
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
      </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
