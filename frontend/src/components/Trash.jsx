import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchJSON, postJSON, deleteJSON } from '../utils/api';

export default function Trash({ onMobileMenuOpen }) {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [deletedItems, setDeletedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTrash();
    }, []);

    // Listen for real-time memory updates from the backend WS
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const token = localStorage.getItem('jarvis_token');
        const wsUrl = `${protocol}//${window.location.host}/ws/chat${token ? `?token=${token}` : ''}`;

        let ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'memory_updated') {
                    console.log('Real-time memory update received, reloading trash...');
                    loadTrash();
                }
            } catch (e) {
                // Ignore parse errors
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, []);

    const loadTrash = async () => {
        setIsLoading(true);
        try {
            const data = await fetchJSON('/api/trash');
            // Backend returns list of items directly or wrapped
            const items = (data.trash || []).map(item => ({
                id: item.id || Math.random().toString(),
                title: item.user || "Conversation",
                preview: item.jarvis ? item.jarvis.substring(0, 80) + "..." : "No content",
                time: item.deleted_at ? new Date(item.deleted_at * 1000).toLocaleDateString() : "Unknown",
                daysLeft: 30, // Mock for now, could be calc based on deleted_at
                icon: 'chat_bubble_outline'
            }));
            setDeletedItems(items);
        } catch (error) {
            console.error("Failed to load trash:", error);
            setDeletedItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await postJSON(`/api/trash/${id}/restore`, {});
            setDeletedItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Restore failed", error);
            alert("Failed to restore item");
        }
    };

    const handleDeleteForever = async (id) => {
        if (window.confirm("Delete this item permanently? This cannot be undone.")) {
            try {
                await deleteJSON(`/api/trash/${id}`);
                setDeletedItems(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete item");
            }
        }
    };

    const handleEmptyTrash = async () => {
        if (deletedItems.length === 0) return;

        if (window.confirm("Are you sure you want to permanently delete all items in the Trash?")) {
            try {
                await deleteJSON(`/api/trash/empty`);
                setDeletedItems([]);
            } catch (error) {
                console.error("Empty trash failed", error);
                alert("Failed to empty trash");
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.16))] relative bg-slate-50 dark:bg-[#070b10] font-display text-slate-900 dark:text-slate-100">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none -z-10 blur-3xl opacity-60" />

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between items-start gap-4 px-4 sm:px-8 py-6 border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-[#070b10]/60 backdrop-blur-2xl z-20 shrink-0 sticky top-0">
                <div className="flex items-center gap-3">
                    <button onClick={onMobileMenuOpen} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
                        <span className="material-icons">menu</span>
                    </button>
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-500 shadow-inner">
                        <span className="material-icons text-2xl">delete_outline</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Trash</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage deleted conversations</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white/50 dark:bg-white/5 backdrop-blur-md p-1 rounded-xl shadow-inner border border-black/5 dark:border-white/5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <span className="material-icons text-xl">view_list</span>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <span className="material-icons text-xl">grid_view</span>
                        </button>
                    </div>
                    <button
                        onClick={handleEmptyTrash}
                        disabled={deletedItems.length === 0}
                        className="px-5 py-2.5 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 hover:shadow-lg dark:hover:shadow-red-500/10 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <span className="material-icons text-lg group-hover:scale-110 transition-transform">delete_forever</span>
                        Empty Trash
                    </button>
                </div>
            </header>

            {/* Warning Banner */}
            <AnimatePresence>
                {deletedItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/20 px-8 py-3 flex items-center gap-3">
                        <span className="material-icons text-amber-600 dark:text-amber-500 text-lg">info</span>
                        <p className="text-sm text-amber-800 dark:text-amber-400 font-bold tracking-wide">Items in trash are permanently deleted after 30 days.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : deletedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full pb-20 opacity-0 animate-fadeIn" style={{ opacity: 1 }}>
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
                            <span className="material-icons text-5xl">delete_outline</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trash is empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2 text-center text-sm">
                            Items you delete will appear here. You can restore them or delete them permanently.
                        </p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3 max-w-5xl mx-auto"}>
                        <AnimatePresence>
                            {deletedItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className={`group bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-5 hover:border-red-500/30 hover:shadow-xl dark:hover:shadow-red-500/10 hover:-translate-y-1 transition-all duration-300 cursor-default shadow-lg shadow-black/5 dark:shadow-black/20 ${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col gap-4'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full bg-slate-100/50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors shrink-0`}>
                                        <span className="material-icons text-xl">{item.icon}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">{item.title}</h3>
                                            {viewMode === 'grid' && <span className="text-[10px] font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full whitespace-nowrap">{item.daysLeft} days left</span>}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.preview}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                            <span>Deleted {item.time}</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 ${viewMode === 'list' && 'ml-4'}`}>
                                        {viewMode === 'list' && <span className="text-[10px] font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full whitespace-nowrap mr-2">{item.daysLeft} days left</span>}
                                        <button
                                            onClick={() => handleRestore(item.id)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                            title="Restore"
                                        >
                                            <span className="material-icons">restore_from_trash</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteForever(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Forever"
                                        >
                                            <span className="material-icons">delete_forever</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
