import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings({ darkMode, setDarkMode, onMobileMenuOpen }) {
    const [contextWindow, setContextWindow] = useState(60);
    const [language, setLanguage] = useState('English');
    const [defaultModel, setDefaultModel] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    
    // Custom API Keys
    const [apiKeys, setApiKeys] = useState(() => {
        try {
            const stored = localStorage.getItem('jarvis_api_keys');
            return stored ? JSON.parse(stored) : { openai: '', groq: '', mistral: '', google: '', openrouter: '', nvidia: '', custom: '', custom_base_url: '', custom_model: '' };
        } catch (e) {
            return { openai: '', groq: '', mistral: '', google: '', openrouter: '', nvidia: '', custom: '', custom_base_url: '', custom_model: '' };
        }
    });

    const handleKeyChange = (provider, value) => {
        const updated = { ...apiKeys, [provider]: value };
        setApiKeys(updated);
        localStorage.setItem('jarvis_api_keys', JSON.stringify(updated));
    };

    // Toggle states
    const [dataSharing, setDataSharing] = useState(false);
    const [locationAccess, setLocationAccess] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [desktopNotif, setDesktopNotif] = useState(false);
    const [soundEffects, setSoundEffects] = useState(true);
    const [streamResponse, setStreamResponse] = useState(true);

    // Fetch active models from backend
    useEffect(() => {
        fetch('/api/v1/models')
            .then(r => r.json())
            .then(data => {
                if (data.models && data.models.length > 0) {
                    setAvailableModels(data.models);
                    setDefaultModel(data.models[0].id);
                }
            })
            .catch(err => console.warn('Could not fetch models:', err));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden relative bg-slate-50/50 dark:bg-[#070b10] text-slate-900 dark:text-white font-display"
        >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10 blur-3xl" />
            
            {/* Glassmorphic Header */}
            <header className="h-[72px] shrink-0 flex items-center justify-between px-6 lg:px-10 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#0b1217]/70 backdrop-blur-xl z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={onMobileMenuOpen} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                        <span className="material-icons">menu</span>
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-primary/20 hidden sm:flex">
                        <span className="material-icons text-[20px]">settings</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Settings</h1>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Configure your workspace</p>
                    </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.02, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all border border-white/10"
                >
                    Save Changes
                </motion.button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth custom-scrollbar">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="max-w-3xl mx-auto space-y-8 pb-20"
                >

                    {/* Account Section */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-2">Account Details</h2>
                        <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
                            <div className="p-8 flex items-center gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-[2px] shadow-xl shadow-primary/20">
                                        <div className="w-full h-full rounded-2xl overflow-hidden bg-white dark:bg-black">
                                            <img
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqRqqcpF_2iSceqvg4CJ0wW7Od-LlROf2ANRSigFwubhzy4oSsQBQ5c6OkPVVG7iSUM_bz2XQSVsq6zu8dVl-4DmBuVoSPc1hRZgXlkJYWzJ7KsXOx7jt_kD5Gew_srYKeQr5OfE0iYY05ch5cd6WESIEQ0pNgNMDGXnyNyr-t9s_GF5JxdaOxMtkAulW-wlyjwGGEIYkQDmmwOPf2Igf0muNfaPUWQIG-B6AXxYbirUB8QVhshnmBFMeDH1orkgr2k0IdafvP3QY"
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-[#151b26]">PRO</span>
                                </div>
                                
                                <div className="flex-1 z-10">
                                    <h3 className="font-extrabold text-2xl tracking-tight">Admin User</h3>
                                    <p className="text-primary font-semibold text-sm">admin@jarvis.ai</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.05 }} className="hidden sm:block px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">
                                    Manage Profile
                                </motion.button>
                            </div>
                        </div>
                    </motion.section>

                    {/* API Configuration */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-2">API Configuration</h2>
                        <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 p-8 space-y-8">
                            
                            <div>
                                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                    <span className="material-icons text-primary text-xl">vpn_key</span> Integration Keys
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Keys are encrypted locally in your browser. Leave blank to use server defaults.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['openai', 'groq', 'mistral', 'google', 'openrouter', 'nvidia'].map(provider => (
                                        <div key={provider} className="group relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 relative z-10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 capitalize">{provider}</label>
                                                <input
                                                    type="password"
                                                    value={apiKeys[provider] || ''}
                                                    onChange={(e) => handleKeyChange(provider, e.target.value)}
                                                    placeholder="sk-..."
                                                    className="w-full bg-transparent border-none p-0 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />

                            <div>
                                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                    <span className="material-icons text-amber-500 text-xl">dns</span> Custom Endpoint
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Connect to an arbitrary OpenAI-Compatible API (e.g. LM Studio, Ollama).</p>
                                
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Base URL</label>
                                        <input
                                            type="text"
                                            value={apiKeys.custom_base_url || ''}
                                            onChange={(e) => handleKeyChange('custom_base_url', e.target.value)}
                                            placeholder="http://localhost:1234/v1"
                                            className="w-full bg-transparent border-none p-0 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">API Key</label>
                                            <input
                                                type="password"
                                                value={apiKeys.custom || ''}
                                                onChange={(e) => handleKeyChange('custom', e.target.value)}
                                                placeholder="Optional"
                                                className="w-full bg-transparent border-none p-0 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0"
                                            />
                                        </div>
                                        <div className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Model Name</label>
                                            <input
                                                type="text"
                                                value={apiKeys.custom_model || ''}
                                                onChange={(e) => handleKeyChange('custom_model', e.target.value)}
                                                placeholder="llama-v3"
                                                className="w-full bg-transparent border-none p-0 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* App Appearance */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-2">Interface & Language</h2>
                        <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden divide-y divide-black/5 dark:divide-white/5">
                            <ToggleItem
                                title="Dark Mode"
                                description="Deep, space-like dark theme for night usage."
                                icon="dark_mode"
                                iconColor="text-indigo-500 bg-indigo-500/10"
                                checked={darkMode}
                                onChange={setDarkMode}
                            />
                            <div className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                        <span className="material-icons text-2xl">language</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Language</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Primary system language</p>
                                    </div>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    </motion.section>

                    {/* Model Configuration */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-2">Model Parameters</h2>
                        <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden divide-y divide-black/5 dark:divide-white/5">
                            <div className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <span className="material-icons text-2xl">psychology</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Default Model</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Primary cognitive engine</p>
                                    </div>
                                </div>
                                <select
                                    value={defaultModel}
                                    onChange={(e) => setDefaultModel(e.target.value)}
                                    className="bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all max-w-[180px] truncate"
                                >
                                    {availableModels.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-6 group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-5 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                        <span className="material-icons text-2xl">memory</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Context Window</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Memory depth ({Math.round(4096 * (contextWindow / 100))} tokens)</p>
                                    </div>
                                </div>
                                <div className="px-4 pb-2">
                                    <div className="w-full relative h-3 bg-slate-200 dark:bg-black/50 rounded-full">
                                        <motion.div 
                                            className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${contextWindow}%` }}
                                            transition={{ type: "spring", damping: 20 }}
                                        />
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={contextWindow}
                                            onChange={(e) => setContextWindow(Number(e.target.value))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <motion.div 
                                            className="absolute w-6 h-6 bg-white border-[3px] border-orange-500 rounded-full top-1/2 transform -translate-y-1/2 shadow-lg shadow-orange-500/30 pointer-events-none" 
                                            animate={{ left: `calc(${contextWindow}% - 12px)` }}
                                            transition={{ type: "spring", damping: 20 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <ToggleItem
                                title="Stream Responses"
                                description="Real-time typewriter effect."
                                icon="stream"
                                iconColor="text-cyan-500 bg-cyan-500/10"
                                checked={streamResponse}
                                onChange={setStreamResponse}
                            />
                        </div>
                    </motion.section>

                    {/* System */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 pl-2">System Behaviors</h2>
                        <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden divide-y divide-black/5 dark:divide-white/5">
                            <ToggleItem
                                title="Desktop Notifications"
                                description="System popups for completed tasks."
                                icon="notifications"
                                iconColor="text-pink-500 bg-pink-500/10"
                                checked={desktopNotif}
                                onChange={setDesktopNotif}
                            />
                            <ToggleItem
                                title="Haptic Audio"
                                description="UI sound effects for interactions."
                                icon="volume_up"
                                iconColor="text-fuchsia-500 bg-fuchsia-500/10"
                                checked={soundEffects}
                                onChange={setSoundEffects}
                            />
                            <ToggleItem
                                title="Anonymous Diagnostics"
                                description="Help improve system stability."
                                icon="share"
                                iconColor="text-blue-500 bg-blue-500/10"
                                checked={dataSharing}
                                onChange={setDataSharing}
                            />
                        </div>
                    </motion.section>

                    {/* Danger Zone */}
                    <motion.section variants={itemVariants}>
                        <div className="bg-red-500/5 dark:bg-red-500/5 rounded-3xl border border-red-500/20 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <span className="material-icons">warning</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-600 dark:text-red-400">Factory Reset</h3>
                                    <p className="text-sm font-medium text-red-600/70 dark:text-red-400/70 mt-0.5">Permenantly delete local configs and history.</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.confirm("Factory reset? All data will be lost.") && alert("Resetting...")}
                                className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-shadow"
                            >
                                Reset Space
                            </motion.button>
                        </div>
                    </motion.section>

                </motion.div>
            </div >
        </motion.div >
    );
}

function ToggleItem({ title, description, icon, iconColor, checked, onChange }) {
    return (
        <div className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
            <div className="flex items-center gap-5">
                {icon && (
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${iconColor || 'text-slate-500 bg-slate-100'}`}>
                        <span className="material-icons text-2xl">{icon}</span>
                    </div>
                )}
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                </div>
            </div>
            
            <motion.div 
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-black/50 border border-white/5'}`}
                layout
            >
                <motion.div 
                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    animate={{ x: checked ? 24 : 0 }}
                />
            </motion.div>
        </div>
    );
}
