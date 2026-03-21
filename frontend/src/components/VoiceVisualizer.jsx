import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceVisualizer({ isActive, audioLevel = 0.5, transcribedText = '' }) {
    // We render 5 bars. Their height scales with audioLevel.
    // audioLevel is expected to be between 0.0 and 1.0

    // Create base heights for the bars to give them a natural waveform shape
    const baseHeights = [0.3, 0.6, 1.0, 0.6, 0.3];

    return (
        <AnimatePresence>
            {(isActive || transcribedText) && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-1/2 -top-16 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50"
                >
                    {isActive ? (
                        <div className="flex items-end justify-center gap-[4px] h-10 w-32 bg-white/80 dark:bg-[#0f151d]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,194,255,0.2)] dark:shadow-[0_8px_30px_-4px_rgba(0,194,255,0.1)] border border-black/5 dark:border-white/10 p-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse pointer-events-none" />
                            {baseHeights.map((base, i) => {
                                // Add some random flutter or use the audio level directly
                                // Map audio level (0-1) to height (10% to 100%)
                                // Use a minimum height so bars are always visible
                                const targetHeight = Math.max(15, (base * audioLevel * 100));

                                return (
                                    <motion.div
                                        key={i}
                                        animate={{ height: `${targetHeight}%` }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20,
                                            mass: 0.5
                                        }}
                                        className="w-1.5 bg-primary rounded-full waveform-bar-glow"
                                        style={{
                                            transformOrigin: 'bottom'
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        transcribedText && (
                            <div className="bg-white/80 dark:bg-[#0f151d]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 max-w-sm px-4 py-2 flex items-center gap-2">
                                <span className="material-icons text-primary text-sm animate-pulse">mic</span>
                                <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                                    "{transcribedText}"
                                </span>
                            </div>
                        )
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
