import { useState } from 'react';
import { motion } from 'framer-motion';
import { getSubjects } from '../../config/examPaths';
import { subjectNameToId, multiPaperSubjects } from '../../pages/SubjectSelection';
import { useSubjectProgress } from '../../hooks/useSubjectProgress';
import PaperPicker from '../PaperPicker';

const subjectSvgMap: Record<string, string> = {
  'বাংলা': 'subject-language',
  'ইংরেজি': 'subject-language',
  'গণিত': 'subject-math',
  'উচ্চতর গণিত': 'subject-math',
  'পদার্থবিদ্যা': 'subject-science',
  'রসায়ন': 'subject-science',
  'জীববিদ্যা': 'subject-science',
  'আইসিটি': 'subject-science',
  'হিসাববিজ্ঞান': 'subject-business',
  'ফিন্যান্স': 'subject-business',
  'ব্যবসায় উদ্যোগ': 'subject-business',
  'অর্থনীতি': 'subject-business',
  'ইতিহাস': 'subject-social',
  'ভূগোল': 'subject-social',
  'নাগরিকতা': 'subject-social',
  'সাধারণ জ্ঞান': 'subject-knowledge',
  'বাংলাদেশ বিষয়াবলী': 'subject-knowledge',
  'বিশ্লেষণী ক্ষমতা': 'subject-math',
  'সমাজ বিজ্ঞান': 'subject-language',
  'সাধারণ বিজ্ঞান': 'subject-science',
  'কৃষি শিক্ষা': 'subject-agriculture',
  'ইসলাম শিক্ষা': 'subject-islam',
};

function getSvgUrl(svgName: string) {
  return `${import.meta.env.BASE_URL || '/'}assets/images/icons/${svgName}.svg`;
}

function SubjectGridCard({ subject, onClick, progress }: { subject: string; onClick: () => void; progress: number }) {
  const svgName = subjectSvgMap[subject] || 'general';
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden flex flex-col items-center justify-end gap-1.5 p-3 rounded-2xl border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,129,72,0.15)] transition-all duration-200 min-h-[120px]"
    >
      <img
        src={getSvgUrl(svgName)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 w-full flex flex-col items-center gap-1.5">
        <span className="text-[11px] font-bold text-white text-center leading-tight drop-shadow-md">{subject}</span>
        <div className="w-full flex items-center gap-1.5">
          <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[9px] font-bold text-white/70 tabular-nums">{progress}%</span>
        </div>
      </div>
    </motion.button>
  );
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
