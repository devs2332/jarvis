import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchJSON } from '../utils/api';

export default function KnowledgeBase({ onMobileMenuOpen }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recent, setRecent] = useState([]);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        fetchJSON('/api/v1/memory?limit=20')
            .then(data => setRecent(data.memories || []))
            .catch(() => { });
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setSearched(true);
        try {
            const data = await fetchJSON(`/api/v1/memory/search?q=${encodeURIComponent(query)}&top_k=10`);
            setResults(data.results || []);
        } catch {
            setResults([]);
        }
    };

    const displayItems = searched ? results : recent;

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#070b10] p-8 relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-20 inset-x-0 h-96 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none -z-10 blur-3xl opacity-60" />
            
            <div className="max-w-4xl mx-auto text-slate-800 dark:text-white relative z-10">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center relative flex flex-col items-center">
                    <div className="w-full flex justify-center items-center mb-2 relative">
                        <button onClick={onMobileMenuOpen} className="absolute left-0 top-0 md:hidden p-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-icons">menu</span>
                        </button>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Knowledge Base</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto">Semantic search across your conversation history and documents.</p>
                </motion.div>

                {/* Search Bar */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-2xl mx-auto mb-10 group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                        <span className="material-icons text-primary/60 text-xl font-bold">search</span>
                    </div>
                    <input
                        className="w-full pl-14 pr-24 py-5 rounded-[2rem] bg-white/70 dark:bg-white/[0.02] backdrop-blur-2xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all duration-300 hover:shadow-2xl hover:border-primary/20 text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="Search memories..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="absolute inset-y-2.5 right-2.5 px-6 font-bold bg-primary text-white rounded-[1.5rem] shadow-lg shadow-primary/30 hover:bg-blue-600 hover:shadow-primary/50 text-sm transition-all active:scale-95 flex items-center justify-center"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </motion.div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                    {displayItems.length === 0 ? (
                        <div className="col-span-2 text-center py-12 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <span className="material-icons text-3xl">content_paste_search</span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">{searched ? 'No results found' : 'Ready to search'}</h3>
                            <p className="text-sm text-slate-500">
                                {searched ? 'Try adjusting your search terms.' : 'Enter a query above to search your knowledge base.'}
                            </p>
                        </div>
                    ) : (
                        displayItems.map((item, i) => (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={item.id || i} className="group bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl dark:hover:shadow-black/40 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase rounded-full tracking-widest">
                                        {item.metadata?.type || 'document'}
                                    </span>
                                    {item.distance !== undefined && item.distance !== null && (
                                        <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                                            <span className="material-icons text-[12px]">check_circle</span>
                                            {((1 - item.distance) * 100).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4 mb-4 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {item.text}
                                </p>
                                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-t border-black/5 dark:border-white/5 pt-4">
                                    <span className="material-icons text-[13px]">schedule</span>
                                    {formatDate(item.metadata?.timestamp)}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
