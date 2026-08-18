import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, BarChart } from 'lucide-react';
import { FEATURE_METADATA } from '../ml/constants.js';

export const DriftMonitor: React.FC = () => {
  const [driftData, setDriftData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterDrift, setFilterDrift] = useState<'all' | 'drifted' | 'stable'>('all');

  const fetchDriftReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drift-report');
      const data = await res.json();
      setDriftData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriftReport();
  }, []);

  const filteredColumns = driftData?.columnDetails?.filter((c: any) => {
    if (filterDrift === 'drifted') return c.drift_status;
    if (filterDrift === 'stable') return !c.drift_status;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono border border-purple-500/20">
                EVIDENTLY AI DRIFT TEST
              </span>
              <span className="text-xs text-slate-500 font-mono">Statistical KS Test (p &lt; 0.05)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-400" />
              Dataset Validation & Feature Drift Report
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Monitors Kolmogorov-Smirnov distribution shifts between reference training datasets (phisingData.csv) and production inference batches. Generated during DataValidation pipeline stage.
            </p>
          </div>

          <button
            onClick={fetchDriftReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run Drift Diagnostics</span>
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Evaluated Feature Columns</span>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {driftData?.total_features || 30}
            </div>
            <span className="text-[11px] text-slate-500">Continuous & categorical attributes</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-950/50">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Pipeline Drift Verdict
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {driftData?.overall_drift_detected ? 'DRIFT DETECTED' : 'DATASET STABLE'}
            </div>
            <span className="text-[11px] text-emerald-400/70">P-value threshold &ge; 0.05</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Artifact YAML Location</span>
            <div className="text-xs font-mono text-cyan-400 mt-1 truncate">
              Artifacts/.../data_validation/drift_report/report.yaml
            </div>
            <span className="text-[11px] text-slate-500">Auto-saved to S3 MLOps bucket</span>
          </div>
        </div>
      </div>

      {/* Feature Drift Detailed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base">Per-Feature Kolmogorov-Smirnov Statistics</h3>

          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterDrift('all')}
              className={`text-xs px-3 py-1 rounded-md ${filterDrift === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
            >
              All Features (30)
            </button>
            <button
              onClick={() => setFilterDrift('stable')}
              className={`text-xs px-3 py-1 rounded-md ${filterDrift === 'stable' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
            >
              Stable (p &ge; 0.05)
            </button>
            <button
              onClick={() => setFilterDrift('drifted')}
              className={`text-xs px-3 py-1 rounded-md ${filterDrift === 'drifted' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-400'}`}
            >
              Drifted (p &lt; 0.05)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px] border border-slate-800 rounded-xl scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-3">Feature Column</th>
                <th className="p-3">Drift Status</th>
                <th className="p-3">KS p-value</th>
                <th className="p-3">Baseline Mean</th>
                <th className="p-3">Current Mean</th>
                <th className="p-3">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredColumns.map((col: any, idx: number) => {
                const meta = (FEATURE_METADATA as any)[col.column];
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{col.column}</span>
                      </div>
                      {meta && <span className="text-[10px] text-slate-500 block font-sans">{meta.label}</span>}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {col.drift_status ? 'DRIFTED' : 'STABLE (PASS)'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-cyan-300">
                      {col.p_value.toFixed(6)}
                    </td>
                    <td className="p-3 text-slate-300">{col.baseline_mean.toFixed(2)}</td>
                    <td className="p-3 text-slate-300">{col.current_mean.toFixed(2)}</td>
                    <td className="p-3 text-slate-400 font-sans text-[11px]">{meta?.category || 'Feature'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
