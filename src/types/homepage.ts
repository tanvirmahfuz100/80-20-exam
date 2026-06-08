export type HomepageCardId =
  | 'subject-grid'
  | 'daily-quiz'
  | 'dashboard-short'
  | 'leaderboard'
  | 'star-review'
  | 'challenges';

export const HOMEPAGE_CARD_META: Record<HomepageCardId, { label: string; description: string }> = {
  'subject-grid': { label: 'সাবজেক্ট সমূহ', description: 'সাবজেক্টের গ্রিড ভিউ' },
  'daily-quiz': { label: 'দৈনিক কুইজ', description: 'প্রতিদিনের ৫টি প্রশ্ন' },
  'dashboard-short': { label: 'ড্যাশবোর্ড সারাংশ', description: 'এক্সপি, স্ট্রিক, একিউরেসি' },
  'leaderboard': { label: 'লিডারবোর্ড', description: 'শীর্ষ ৫ অবস্থান' },
  'star-review': { label: 'স্টার রিভিউ', description: 'আজকের পর্যালোচনা' },
  'challenges': { label: 'চ্যালেঞ্জ', description: 'দৈনিক ও সাপ্তাহিক চ্যালেঞ্জ' },
};

export const DEFAULT_SEGMENTS: HomepageCardId[] = [
  'subject-grid',
  'daily-quiz',
  'dashboard-short',
];

export const ALL_CARDS: HomepageCardId[] = [
  'subject-grid',
  'daily-quiz',
  'dashboard-short',
  'leaderboard',
  'star-review',
  'challenges',
];

export interface HomepageLayout {
  segments: HomepageCardId[];
}
