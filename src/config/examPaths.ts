// Single source of truth for exam paths, groups, classes, media, and subjects.
// Edit only this file to add/remove paths or change subject lists.

export const EXAMS = ['SSC', 'HSC', 'BCS', 'IBA', 'Class1-8'];

export const GROUPS = ['Science', 'Business', 'Arts'];

export const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8];

export const MEDIA = ['Bangla', 'English'];

const EXAM_SUBJECTS = {
  'SSC-Science':  ['বাংলা', 'ইংরেজি', 'গণিত',      'পদার্থবিদ্যা', 'রসায়ন',     'জীববিদ্যা',   'আইসিটি',   'কৃষি শিক্ষা', 'ইসলাম শিক্ষা'],
  'SSC-Business': ['বাংলা', 'ইংরেজি', 'গণিত',      'হিসাববিজ্ঞান', 'ফিন্যান্স',  'ব্যবসায় উদ্যোগ', 'আইসিটি', 'সাধারণ বিজ্ঞান', 'কৃষি শিক্ষা', 'ইসলাম শিক্ষা'],
  'SSC-Arts':     ['বাংলা', 'ইংরেজি', 'গণিত',      'ইতিহাস',      'ভূগোল',      'নাগরিকতা',   'আইসিটি',   'সাধারণ বিজ্ঞান', 'কৃষি শিক্ষা', 'ইসলাম শিক্ষা'],
  'HSC-Science':  ['বাংলা', 'ইংরেজি', 'উচ্চতর গণিত', 'পদার্থবিদ্যা', 'রসায়ন',     'জীববিদ্যা'],
  'HSC-Business': ['বাংলা', 'ইংরেজি', 'হিসাববিজ্ঞান', 'ফিন্যান্স',   'অর্থনীতি',   'ব্যবসায় উদ্যোগ'],
  'HSC-Arts':     ['বাংলা', 'ইংরেজি', 'ইতিহাস',      'ভূগোল',      'নাগরিকতা',   'অর্থনীতি'],
  'BCS':          ['বাংলা', 'ইংরেজি', 'গণিত',        'সাধারণ জ্ঞান', 'বাংলাদেশ বিষয়াবলী', 'আইসিটি'],
  'IBA':          ['ইংরেজি', 'গণিত',  'বিশ্লেষণী ক্ষমতা'],
};

export const EXAM_LABELS = {
  SSC:      'এসএসসি',
  HSC:      'এইচএসসি',
  BCS:      'বিসিএস',
  IBA:      'আইবিএ',
  'Class1-8': 'ক্লাস ১-৮',
};

export const GROUP_LABELS = {
  Science:  'বিজ্ঞান',
  Business: 'বাণিজ্য',
  Arts:     'মানবিক',
};

export const MEDIUM_LABELS = {
  Bangla:  'বাংলা',
  English: 'ইংরেজি',
};

export function requiresGroup(exam) {
  return exam === 'SSC' || exam === 'HSC';
}

export function requiresClass(exam) {
  return exam === 'Class1-8';
}

export function requiresMedium(exam) {
  return exam === 'SSC' || exam === 'HSC' || exam === 'Class1-8';
}

/** Returns the list of subjects for a given exam + group combination.
 *  Group is ignored for exams that don't require it (BCS, IBA, Class1-8). */
export function getSubjects(exam, group) {
  const key = requiresGroup(exam) ? `${exam}-${group}` : exam;
  return EXAM_SUBJECTS[key] || [];
}

/** Returns a human-readable label like "এসএসসি · বিজ্ঞান" or "ক্লাস ১-৮ · ৫ম শ্রেণী" */
export function getPathLabel(exam, group, cls, medium) {
  let label = EXAM_LABELS[exam] || exam;
  if (group && requiresGroup(exam)) {
    label += ` · ${GROUP_LABELS[group] || group}`;
  }
  if (cls && requiresClass(exam)) {
    label += ` · ${cls}ম শ্রেণী`;
  }
  if (medium && requiresMedium(exam)) {
    label += ` · ${MEDIUM_LABELS[medium] || medium}`;
  }
  return label;
}
