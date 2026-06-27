import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Brain, Atom, Beaker, Microscope, Globe,
  Calculator, BarChart3, MapPin, History,
  Landmark, PieChart, Briefcase, Zap,
  Sparkles, FlaskConical, Sprout, BookHeart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getSubjects } from '../../config/examPaths';
import { subjectNameToId, multiPaperSubjects } from '../../pages/SubjectSelection';
import { useSubjectProgress } from '../../hooks/useSubjectProgress';
import PaperPicker from '../PaperPicker';

const subjectIconMap: Record<string, LucideIcon> = {
  'বাংলা': BookOpen,
  'ইংরেজি': BookOpen,
  'গণিত': Brain,
  'উচ্চতর গণিত': Brain,
  'পদার্থবিদ্যা': Atom,
  'রসায়ন': Beaker,
  'জীববিদ্যা': Microscope,
  'আইসিটি': Globe,
  'হিসাববিজ্ঞান': Calculator,
  'ফিন্যান্স': BarChart3,
  'ব্যবসায় উদ্যোগ': Briefcase,
  'অর্থনীতি': PieChart,
  'ইতিহাস': History,
  'ভূগোল': MapPin,
  'নাগরিকতা': Landmark,
  'সাধারণ জ্ঞান': Globe,
  'বাংলাদেশ বিষয়াবলী': MapPin,
  'বিশ্লেষণী ক্ষমতা': Brain,
  'সমাজ বিজ্ঞান': BookOpen,
  'সাধারণ বিজ্ঞান': FlaskConical,
  'কৃষি শিক্ষা': Sprout,
  'ইসলাম শিক্ষা': BookHeart,
};

function SubjectGridCard({ subject, onClick, progress }: { subject: string; onClick: () => void; progress: number }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,129,72,0.15)] transition-all duration-200"
    >
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
        {renderSubjectIcon(subject)}
      </div>
      <span className="text-[11px] font-bold text-text text-center leading-tight">{subject}</span>
      <div className="w-full flex items-center gap-1.5">
        <div className="flex-1 h-1 rounded-full bg-surface-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[9px] font-bold text-text-muted tabular-nums">{progress}%</span>
      </div>
    </motion.button>
  );
}

function renderSubjectIcon(name: string) {
  const Icon = subjectIconMap[name] || BookOpen;
  return <Icon className="w-5 h-5 text-primary" />;
}

interface SubjectGridCardsProps {
  examPath: { exam: string; group?: string };
  onNavigate: (url: string) => void;
}

export default function SubjectGridCards({ examPath, onNavigate }: SubjectGridCardsProps) {
  const [paperPicker, setPaperPicker] = useState({ open: false, subject: '' });
  const subjects = getSubjects(examPath.exam, examPath.group) || [];
  const subjectProgress = useSubjectProgress(examPath.exam);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-sm text-text">সাবজেক্ট সমূহ</h2>
        <span className="text-xs text-text-muted font-bold">{subjects.length}টি সাবজেক্ট</span>
      </div>
      {subjects.length === 0 ? (
        <p className="text-xs text-text-muted font-medium text-center py-6">কোনো সাবজেক্ট পাওয়া যায়নি</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          {subjects.map((subject: string) => (
            <SubjectGridCard
              key={subject}
              subject={subject}
              progress={subjectProgress[subject] ?? 0}
              onClick={() => {
                if (multiPaperSubjects[subject]) {
                  setPaperPicker({ open: true, subject });
                  return;
                }
                const subjId = subjectNameToId[subject];
                const url = subjId
                  ? `/practice?exam=${examPath.exam.toLowerCase()}&subjectId=${subjId}`
                  : `/practice?exam=${examPath.exam.toLowerCase()}`;
                onNavigate(url);
              }}
            />
          ))}
        </motion.div>
      )}
      <PaperPicker
        isOpen={paperPicker.open}
        onClose={() => setPaperPicker({ open: false, subject: '' })}
        onSelect={(paperId: string) => {
          setPaperPicker({ open: false, subject: '' });
          const url = `/practice?exam=${examPath.exam.toLowerCase()}&subjectId=${paperId}`;
          onNavigate(url);
        }}
        exam={examPath.exam.toLowerCase()}
        subjectName={paperPicker.subject}
      />
    </div>
  );
}
