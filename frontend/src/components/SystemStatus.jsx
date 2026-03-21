import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchJSON } from '../utils/api';

export default function SystemStatus({ onMobileMenuOpen }) {
    const [status, setStatus] = useState(null);
    const [facts, setFacts] = useState({});

    useEffect(() => {
        fetchJSON('/api/v1/status').then(setStatus).catch(() => { });
        fetchJSON('/api/v1/facts').then(data => setFacts(data.facts || {})).catch(() => { });
    }, []);

    if (!status) {
        return (
            <div className="flex-1 flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <span className="material-icons text-4xl text-slate-300 animate-spin">refresh</span>
                    <p className="mt-2 text-slate-500">Connecting to system...</p>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon, color, title, value, sub, children }) => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="group bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl dark:hover:shadow-black/40 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${color}`} />
            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color} shadow-${color.replace('bg-', '')}/30`}>
                    <span className="material-icons text-xl">{icon}</span>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">{title}</div>
                </div>
            </div>
            <div className="relative z-10">
                {sub && <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">{sub}</div>}
                {children}
            </div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#070b10] p-8 relative">
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none -z-10 blur-3xl opacity-60" />
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onMobileMenuOpen} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-icons">menu</span>
                        </button>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Status</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mt-2 ml-10 md:ml-0">Real-time platform telemetry and connection health.</p>
                </div>

                <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        icon="smart_toy"
                        color="bg-blue-500"
                        title="LLM Provider"
                        value={status.llm_provider?.toUpperCase()}
                        sub="Active AI Model"
                    />

                    <StatCard
                        icon="storage"
                        color="bg-purple-500"
                        title="Vector Memory"
                        value={status.vector_memory?.total_documents ?? 0}
                        sub="Documents in ChromaDB"
                    />

                    <StatCard
                        icon="api"
                        color="bg-cyan-500"
                        title="API Server"
                        value="ONLINE"
                        sub="FastAPI v2.0.0"
                    >
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-500 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Operational
                        </div>
                    </StatCard>

                    <StatCard
                        icon="extension"
                        color="bg-green-500"
                        title="Tools"
                        value={status.tools_count}
                        sub="Registered Extensions"
                    >
                        <div className="flex flex-wrap gap-1 mt-2">
                            {status.tools?.slice(0, 6).map(tool => (
                                <span key={tool} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded">
                                    {tool}
                                </span>
                            ))}
                            {status.tools?.length > 6 && <span className="text-[10px] text-slate-400">+ more</span>}
                        </div>
                    </StatCard>

                    <StatCard
                        icon="memory"
                        color="bg-orange-500"
                        title="Facts"
                        value={Object.keys(facts).length}
                        sub="Key-Value Memories"
                    >
                        <div className="space-y-1 mt-2">
                            {Object.entries(facts).slice(0, 3).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs border-b border-slate-100 dark:border-slate-700 pb-1 last:border-0">
                                    <span className="font-medium text-slate-600 dark:text-slate-300">{k}</span>
                                    <span className="text-slate-400 truncate max-w-[100px]">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                                </div>
                            ))}
                        </div>
                    </StatCard>

                    <StatCard
                        icon="architecture"
                        color="bg-indigo-500"
                        title="Architecture"
                        value="RAG"
                        sub="Retrieval Augmented Gen"
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
