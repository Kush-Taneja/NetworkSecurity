import React, { useState } from 'react';
import { Search, AlertOctagon, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert, ArrowRight, RefreshCw, Lock, Globe, Server, Hash } from 'lucide-react';
import { FEATURE_METADATA } from '../ml/constants.js';

export const UrlInspector: React.FC = () => {
  const [urlInput, setUrlInput] = useState('http://paypal-verification-account-update.secure-login.xyz/auth?user=victim');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleScan = async (targetUrl?: string) => {
    const urlToScan = targetUrl || urlInput;
    if (!urlToScan) return;
    setLoading(true);
    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleScan(urlInput);
  }, []);

  const sampleUrls = [
    { label: 'Fake PayPal Phishing (Hyphen + Multi-Subdomain)', url: 'http://paypal-verification-account-update.secure-login.xyz/auth?user=victim' },
    { label: 'Raw IP Address Login (Phishing)', url: 'http://192.168.1.45/bank-security-pin-verify/' },
    { label: 'Legitimate Google Portal (Trusted)', url: 'https://accounts.google.com/ServiceLogin' },
    { label: 'Apple ID Credential Stealer (Suspicious)', url: 'http://appleid.apple.com.verify-device-portal.cc/sign-in' },
  ];

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Moderate': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const categories = ['all', 'URL & Domain', 'Security & Certificate', 'Page Content & Behavior', 'Reputation & External'];

  const filteredExplanations = result?.explanations?.filter((item: any) => {
    if (filterCategory === 'all') return true;
    const meta = (FEATURE_METADATA as any)[item.feature];
    return meta?.category === filterCategory;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Real-Time URL Phishing Feature Extractor & Classifier
            </h2>
            <p className="text-sm text-slate-400">
              Parses raw URL components, extracts 30 heuristic cybersecurity indicators, and runs the pre-trained Random Forest ML model.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL to inspect (e.g. http://login.bank-update.xyz/verify)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Analyze URL</span>
          </button>
        </form>

        {/* Quick Sample Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Preset Threat Scenarios:</span>
          <div className="flex flex-wrap gap-2">
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(s.url);
                  handleScan(s.url);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>{s.label}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Cards */}
      {result && result.prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Verdict Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">ML Prediction Verdict</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getThreatColor(result.prediction.threat_level)}`}>
                  {result.prediction.threat_level} Risk
                </span>
              </div>

              <div className="text-center py-4">
                {result.prediction.prediction_label === 'Phishing' ? (
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mb-3 shadow-lg shadow-red-500/20">
                    <AlertOctagon className="w-10 h-10 text-red-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                )}
                <h3 className={`text-2xl font-black ${result.prediction.prediction_label === 'Phishing' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {result.prediction.prediction_label === 'Phishing' ? 'PHISHING DETECTED' : 'LEGITIMATE URL'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Confidence: <span className="text-white font-mono font-bold">{(result.prediction.confidence * 100).toFixed(1)}%</span>
                </p>
              </div>

              {/* Threat Gauge */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-2">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Phishing Risk Score</span>
                  <span className="font-mono font-bold text-white">{result.prediction.risk_score} / 100</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.prediction.risk_score > 70 ? 'bg-red-500' : result.prediction.risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.prediction.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Key Risk Factors */}
              {result.prediction.top_risk_factors?.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Detected Threat Signals:</span>
                  <div className="space-y-1.5">
                    {result.prediction.top_risk_factors.map((rf: string, i: number) => (
                      <div key={i} className="text-xs p-2 rounded bg-red-950/40 border border-red-900/50 text-red-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <span>{rf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              Evaluated URL: <span className="text-slate-300 break-all">{result.url}</span>
            </div>
          </div>

          {/* 30 Features Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">30 Extracted Feature Vectors</h3>
                <p className="text-xs text-slate-400">Schema compliant with data_schema/schema.yaml & training pipeline</p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilterCategory(c)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition ${
                      filterCategory === c
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {c === 'all' ? 'All (30)' : c}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] border border-slate-800 rounded-xl scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-mono sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Feature Name</th>
                    <th className="p-3">Extracted Value</th>
                    <th className="p-3">Evaluation Meaning</th>
                    <th className="p-3">Security Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredExplanations.map((item: any, idx: number) => {
                    const meta = (FEATURE_METADATA as any)[item.feature];
                    const isPhishing = item.value === -1;
                    const isLegit = item.value === 1;
                    return (
                      <tr key={idx} className={`hover:bg-slate-800/50 transition ${isPhishing ? 'bg-red-950/20' : ''}`}>
                        <td className="p-3 font-mono font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            {isPhishing ? (
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                            ) : isLegit ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                            <span>{item.feature}</span>
                          </div>
                          {meta && <span className="text-[10px] text-slate-500 block">{meta.label}</span>}
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              item.value === 1
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.value === -1
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.value}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-xs ${isPhishing ? 'text-red-300' : isLegit ? 'text-emerald-300' : 'text-slate-400'}`}>
                            {item.description}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {meta?.category || 'General'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
