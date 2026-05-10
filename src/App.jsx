import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const AppContent = () => {
  useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Dashboard />} />

        <Route path="/courses" element={<Courses />} />
        <Route path="/practice" element={<PracticeConfig />} />
        <Route path="/bank" element={<QuestionBank />} />
        <Route path="/mock-tests" element={<MockTests />} />
        <Route path="/shorts" element={<VideoFeed />} />
        <Route path="/quiz/:chapterId" element={<Quiz />} />

        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="/welcome" element={<Landing />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
