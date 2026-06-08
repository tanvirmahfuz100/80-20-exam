import { motion } from 'framer-motion';
import type { HomepageCardId } from '../../types/homepage';
import { useHomepageLayout } from '../../hooks/useHomepageLayout';
import SubjectGridCards from './SubjectGridCards';
import DailyQuizCard from './DailyQuizCard';
import DashboardShortCard from './DashboardShortCard';
import LeaderboardCard from './LeaderboardCard';
import StarReviewCard from './StarReviewCard';
import ChallengesCard from './ChallengesCard';

interface HomepageLayoutProps {
  examPath: { exam: string; group?: string };
  onNavigate: (url: string) => void;
}

const CARD_REGISTRY: Record<HomepageCardId, React.ComponentType<any>> = {
  'subject-grid': SubjectGridCards,
  'daily-quiz': DailyQuizCard,
  'dashboard-short': DashboardShortCard,
  'leaderboard': LeaderboardCard,
  'star-review': StarReviewCard,
  'challenges': ChallengesCard,
};

const CARD_PROPS_MAP: Record<HomepageCardId, (props: HomepageLayoutProps) => Record<string, any>> = {
  'subject-grid': (props) => ({ examPath: props.examPath, onNavigate: props.onNavigate }),
  'daily-quiz': (props) => ({ exam: props.examPath.exam, group: props.examPath.group }),
  'dashboard-short': () => ({}),
  'leaderboard': () => ({}),
  'star-review': () => ({}),
  'challenges': (props) => ({ exam: props.examPath.exam }),
};

export default function HomepageLayout(props: HomepageLayoutProps) {
  const { segments } = useHomepageLayout();

  if (segments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-muted font-medium">কোনো কার্ড সক্রিয় নেই</p>
        <p className="text-xs text-text-dim mt-1">কাস্টমাইজ করে কার্ড যোগ করো</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {segments.map((cardId, index) => {
        const Component = CARD_REGISTRY[cardId];
        if (!Component) return null;

        const getProps = CARD_PROPS_MAP[cardId];
        const cardProps = getProps ? getProps(props) : {};

        return (
          <motion.div
            key={cardId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
          >
            <Component {...cardProps} />
          </motion.div>
        );
      })}
    </div>
  );
}
