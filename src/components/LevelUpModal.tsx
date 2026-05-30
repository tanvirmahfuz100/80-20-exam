import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LevelUpModal: React.FC = () => {
    const [show, setShow] = useState(false);
    const [level, setLevel] = useState(0);

    useEffect(() => {
        const raw = localStorage.getItem('exam_leveled_up');
        if (raw) {
            try {
                const data = JSON.parse(raw);
                setLevel(data.level || 1);
            } catch {
                setLevel(1);
            }
            setShow(true);
        }
    }, []);

    const handleDismiss = () => {
        setShow(false);
        localStorage.removeItem('exam_leveled_up');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-surface border border-primary/20 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-black text-text mb-1">লেভেল আপ!</h2>
                        <p className="text-3xl font-black text-primary mb-2">Level {level}</p>
                        <p className="text-sm text-text-muted font-medium mb-6">
                            তুমি লেভেল {level}-এ পৌঁছেছো! অভিনন্দন 🎉
                        </p>
                        <button
                            onClick={handleDismiss}
                            className="w-full py-3 bg-primary text-white rounded-full font-black text-sm active:scale-[0.97] transition-all"
                        >
                            চলো চালিয়ে যাই!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
