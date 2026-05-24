export const readStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn(`[storage] Failed to write key: ${key}`);
  }
};
