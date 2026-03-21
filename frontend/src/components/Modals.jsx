import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, actions }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative bg-white/90 dark:bg-[#070b10]/90 backdrop-blur-3xl rounded-[2rem] shadow-2xl shadow-black/10 dark:shadow-black/40 w-full max-w-md overflow-hidden border border-black/5 dark:border-white/10"
                >
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10 blur-2xl opacity-50" />
                    <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center relative z-10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-icons text-xl">close</span>
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                    {actions && (
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex justify-end gap-3 relative z-10">
                            {actions}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Conversation"
            actions={
                <>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-bold active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all text-sm font-bold shadow-md shadow-red-500/20 active:scale-95"
                    >
                        Delete
                    </button>
                </>
            }
        >
            <p className="text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{itemName}"</span>? This action cannot be undone.
            </p>
        </Modal>
    );
}

export function ExportHistoryModal({ isOpen, onClose, onExport }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export Chat History"
            actions={
                <>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-sm font-bold active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onExport}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-blue-600 transition-all text-sm font-bold shadow-md shadow-primary/30 active:scale-95"
                    >
                        Export
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Choose a format to export your conversation history.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 group">
                        <span className="material-icons text-4xl text-slate-400 group-hover:text-primary mb-3 transition-colors">description</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">PDF Document</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-primary/50 hover:bg-blue-50/50 dark:hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300 group">
                        <span className="material-icons text-4xl text-slate-400 group-hover:text-primary mb-3 transition-colors">code</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">JSON Data</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
}
