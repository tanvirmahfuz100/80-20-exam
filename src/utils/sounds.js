const base = import.meta.env.BASE_URL || '/';

const sounds = {
    correctAnswer: new Audio(`${base}audio/correct_answer.mp3`),
    star: new Audio(`${base}audio/star.mp3`),
    levelUp: new Audio(`${base}audio/level_up.mp3`),
    bonus: new Audio(`${base}audio/bonus.mp3`),
    interface: new Audio(`${base}audio/interface.mp3`),
    notification: new Audio(`${base}audio/notification.mp3`),
    rank: new Audio(`${base}audio/rank.mp3`),
    time: new Audio(`${base}audio/time.mp3`),
};

export const playSound = (soundName) => {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
};

export const preloadSounds = () => {
    Object.values(sounds).forEach(sound => {
        sound.load();
    });
};