import React, { useState } from 'react';
import { Navbar, TabType } from './components/Navbar.js';
import { UrlInspector } from './components/UrlInspector.js';
import { BatchPredictor } from './components/BatchPredictor.js';
import { TrainingConsole } from './components/TrainingConsole.js';
import { DriftMonitor } from './components/DriftMonitor.js';
import { DataStoreView } from './components/DataStoreView.js';
import { ApiDocsView } from './components/ApiDocsView.js';
import { ShieldCheck, ShieldAlert, Cpu, Terminal, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inspector');
  const [isTraining, setIsTraining] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTraining={isTraining}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inspector' && <UrlInspector />}
        {activeTab === 'batch' && <BatchPredictor />}
        {activeTab === 'training' && (
          <TrainingConsole
            onTrainingStart={() => setIsTraining(true)}
            onTrainingEnd={() => setIsTraining(false)}
          />
        )}
        {activeTab === 'drift' && <DriftMonitor />}
        {activeTab === 'datastore' && <DataStoreView />}
        {activeTab === 'docs' && <ApiDocsView />}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Network Security Phishing Detection ML System</span>
            <span className="text-slate-600">|</span>
            <span>Node.js / Express / React Migrated Runtime</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a href="/train" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition font-mono">
              /train
            </a>
            <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition font-mono">
              /docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
