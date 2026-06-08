import { useSoundStore } from '../stores/soundStore';

if (typeof window !== 'undefined') {
    const unlockAudio = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(0);
            osc.stop(0.001);
        } catch { /* AudioContext may not be available */ }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
}

const base = import.meta.env.BASE_URL || '/';

const sounds: Record<string, HTMLAudioElement> = {
    correctAnswer: new Audio(`${base}audio/correct_answer.mp3`),
    wrongAnswer: new Audio(`${base}audio/wrong_answer.mp3`),
    click: new Audio(`${base}audio/click.mp3`),
    star: new Audio(`${base}audio/star.mp3`),
    levelUp: new Audio(`${base}audio/level_up.mp3`),
    bonus: new Audio(`${base}audio/bonus.mp3`),
    interface: new Audio(`${base}audio/interface.mp3`),
    notification: new Audio(`${base}audio/notification.mp3`),
    rank: new Audio(`${base}audio/rank.mp3`),
    time: new Audio(`${base}audio/time.mp3`),
};

const ALIASES: Record<string, string> = {
    pageChange: 'interface',
};

export const playSound = (soundName: string) => {
    const storeKey = ALIASES[soundName] ? soundName : soundName;
    const state = useSoundStore.getState();
    if (state.globalMute) return;
    const setting = state.getSetting(storeKey);
    if (!setting.enabled) return;

    const resolved = ALIASES[soundName] || soundName;
    const sound = sounds[resolved];
    if (sound) {
        sound.currentTime = 0;
        sound.volume = setting.volume / 100;
        sound.play().catch(() => {});
    }
};

export const preloadSounds = () => {
    Object.values(sounds).forEach(sound => {
        sound.load();
    });
};