import { readStorage, writeStorage } from '../utils/storage';

const STREAK_KEY = 'exam_streak_data';

export function getStreakData(userId) {
  const all = readStorage(STREAK_KEY, {});
  return all[userId] || { history: [], lastCheckIn: null };
}

function saveStreakData(userId, data) {
  const all = readStorage(STREAK_KEY, {});
  all[userId] = data;
  writeStorage(STREAK_KEY, all);
}

function getDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayStr() {
  return getDateStr(new Date());
}

function getDaysBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86400000);
}

export function recordDailyCheckIn(userId) {
  const data = getStreakData(userId);
  const today = getTodayStr();

  if (data.history[data.history.length - 1] === today) {
    return getCurrentStreak(userId);
  }

  data.history.push(today);
  data.lastCheckIn = today;
  saveStreakData(userId, data);

  return getCurrentStreak(userId);
}

export function getCurrentStreak(userId) {
  const data = getStreakData(userId);
  if (data.history.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = data.history.length - 1; i >= 0; i--) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - streak);
    const expectedStr = getDateStr(expected);

    if (data.history[i] === expectedStr) {
      streak++;
    } else if (data.history[i] < expectedStr) {
      break;
    }
  }

  return streak;
}

export function getStreakHistory(userId, days = 30) {
  const data = getStreakData(userId);
  const historySet = new Set(data.history);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getDateStr(date);
    result.push({
      date: dateStr,
      day: date.getDate(),
      weekday: date.toLocaleDateString('en', { weekday: 'short' }),
      checkedIn: historySet.has(dateStr),
      isToday: i === 0,
    });
  }

  return result;
}
