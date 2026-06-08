import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings2, Sparkles } from 'lucide-react';
import { useExamPath } from '../hooks/useExamPath';
import ExamOnboarding from '../components/ExamOnboarding';
import ExamChangerDropdown from '../components/ExamChangerDropdown';
import HomepageLayout from '../components/homepage/HomepageLayout';
import HomepageCustomizer from '../components/homepage/HomepageCustomizer';

export default function Learn() {
  const { examPath, setExamPath } = useExamPath();
  const navigate = useNavigate();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const handleSelectorComplete = (path) => {
    setExamPath(path);
  };

  if (!examPath) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <ExamOnboarding onComplete={handleSelectorComplete} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-text">তোমার কোর্স</h1>
          <button
            onClick={() => setCustomizerOpen(true)}
            className="w-9 h-9 rounded-xl bg-surface border flex items-center justify-center hover:bg-surface-hover transition-all active:scale-95"
            title="হোমপেজ কাস্টমাইজ"
          >
            <Settings2 className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <ExamChangerDropdown
          currentExamPath={examPath}
          onExamChange={handleSelectorComplete}
        />
      </div>

      <HomepageLayout
        examPath={examPath}
        onNavigate={(url) => navigate(url)}
      />

      <HomepageCustomizer
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />
    </div>
  );
}
