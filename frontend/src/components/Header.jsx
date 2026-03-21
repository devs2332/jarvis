import React from 'react';

export default function Header({ activeView, researchMode, setResearchMode, language, setLanguage }) {
    const titles = {
        chat: 'Chat',
        knowledge: 'Knowledge Base',
        status: 'System Status',
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#070b10]/70 backdrop-blur-2xl sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{titles[activeView] || 'Dashboard'}</h2>
                {activeView === 'chat' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                        Beta
                    </span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setResearchMode(!researchMode)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${researchMode
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/30 hover:shadow-purple-500/50 border border-white/10'
                            : 'bg-white/50 dark:bg-white/5 text-slate-600 hover:bg-white/80 dark:hover:bg-white/10 dark:text-slate-300 border border-black/5 dark:border-white/5'
                        }`}
                >
                    <span className="material-icons text-sm">{researchMode ? 'psychology' : 'bolt'}</span>
                    {researchMode ? 'Deep Research' : 'Fast Mode'}
                </button>

                <button
                    onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 text-slate-600 hover:bg-white/80 dark:hover:bg-white/10 dark:text-slate-300 border border-black/5 dark:border-white/5 transition-all shadow-sm"
                >
                    <span className="material-icons text-sm">translate</span>
                    {language === 'English' ? 'English' : 'Hindi'}
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

                <div className="flex items-center gap-1.5 text-[11px] font-black tracking-wide text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                    <span className="material-icons text-[14px]">dataset</span>
                    RAG Active
                </div>
            </div>
        </header>
    );
}
