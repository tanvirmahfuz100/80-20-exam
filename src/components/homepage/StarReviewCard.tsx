import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { getPendingMistakesBySubject, getMistakeGroups } from '../../services/review';

export default function StarReviewCard() {
  const [subjectGroups] = useState<{ subject: string; count: number }[]>(() => getPendingMistakesBySubject());
  const [totalDue] = useState(() =>
    getMistakeGroups().reduce((sum: number, g: { dueNow: number }) => sum + g.dueNow, 0)
  );

  if (totalDue === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-yellow-400/15 bg-surface p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <h2 className="font-black text-sm text-text">স্টার রিভিউ</h2>
          <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-[9px] font-black text-yellow-400">
            {totalDue}টি বাকি
          </span>
        </div>
        <Link
          to="/stars"
          className="text-2xs font-bold text-yellow-400 hover:underline flex items-center gap-1"
        >
          রিভিউ করো <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {subjectGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjectGroups.map(g => (
            <span
              key={g.subject}
              className="px-2.5 py-1 rounded-full bg-yellow-400/5 border border-yellow-400/10 text-[10px] font-bold text-yellow-400/80"
            >
              {g.subject} ({g.count})
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
