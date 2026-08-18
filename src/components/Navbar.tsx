import React from 'react';
import { ShieldCheck, Cpu, UploadCloud, Activity, Database, BookOpen, AlertTriangle } from 'lucide-react';

export type TabType = 'inspector' | 'batch' | 'training' | 'drift' | 'datastore' | 'docs';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isTraining: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isTraining }) => {
  const tabs = [
    { id: 'inspector' as TabType, label: 'Live URL Scanner', icon: ShieldCheck, badge: 'Realtime' },
    { id: 'batch' as TabType, label: 'Batch CSV Predictor', icon: UploadCloud, badge: 'FastAPI /predict' },
    { id: 'training' as TabType, label: 'ML Training Pipeline', icon: Cpu, badge: 'MLflow' },
    { id: 'drift' as TabType, label: 'Data Drift & Validation', icon: Activity, badge: 'Evidently' },
    { id: 'datastore' as TabType, label: 'MongoDB Feature Store', icon: Database, badge: 'Atlas' },
    { id: 'docs' as TabType, label: 'API & Swagger Docs', icon: BookOpen, badge: '/docs' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">NetworkSec</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                  ML Phishing Defense
                </span>
              </div>
              <p className="text-xs text-slate-400">Enterprise Phishing Classifier & MLOps Pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isTraining && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Training Pipeline Running...</span>
              </div>
            )}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Model: Random Forest (96.3% Acc)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
