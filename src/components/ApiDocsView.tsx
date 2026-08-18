import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, ExternalLink, Play, ArrowRight } from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [liveTestResponse, setLiveTestResponse] = useState<string | null>(null);
  const [liveTestingEndpoint, setLiveTestingEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/train',
      title: 'Run Training Pipeline',
      desc: 'Executes the end-to-end training pipeline, evaluates models, computes metrics, and produces artifacts.',
      curl: 'curl -X GET "http://localhost:3000/train"',
      jsonExample: 'curl -X GET "http://localhost:3000/train?format=json"',
    },
    {
      method: 'POST',
      path: '/predict',
      title: 'Batch Phishing Prediction (CSV Upload)',
      desc: 'Takes a CSV file with 30 network security features and returns predictions with table HTML or JSON.',
      curl: 'curl -X POST "http://localhost:3000/predict" -F "file=@valid_data/test.csv"',
      jsonExample: 'curl -X POST "http://localhost:3000/predict" -H "Content-Type: application/json" -d \'{"data":[{"having_IP_Address":1,"URL_Length":-1,"SSLfinal_State":1,"URL_of_Anchor":1}]}\'',
    },
    {
      method: 'POST',
      path: '/api/extract-url',
      title: 'Extract & Classify Live URL',
      desc: 'Parses a URL string, automatically computes all 30 feature vectors, and returns phishing probability.',
      curl: 'curl -X POST "http://localhost:3000/api/extract-url" -H "Content-Type: application/json" -d \'{"url":"http://paypal-verification-account.xyz/auth"}\'',
    },
    {
      method: 'GET',
      path: '/docs',
      title: 'FastAPI Interactive Swagger UI',
      desc: 'Interactive OpenAPI specification explorer and swagger UI documentation.',
      curl: 'curl -X GET "http://localhost:3000/docs" -H "Accept: application/json"',
    },
    {
      method: 'GET',
      path: '/api/drift-report',
      title: 'Evidently Data Drift Report',
      desc: 'Retrieves Kolmogorov-Smirnov statistical drift tests across all 30 feature columns.',
      curl: 'curl -X GET "http://localhost:3000/api/drift-report"',
    }
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const testEndpoint = async (endpoint: any) => {
    setLiveTestingEndpoint(endpoint.path);
    setLiveTestResponse(null);
    try {
      let res: Response;
      if (endpoint.path === '/train') {
        res = await fetch('/train?format=json');
      } else if (endpoint.path === '/api/extract-url') {
        res = await fetch('/api/extract-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: 'http://paypal-update.fake-domain.xyz' })
        });
      } else if (endpoint.path === '/predict') {
        res = await fetch('/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [{ having_IP_Address: -1, URL_Length: -1, SSLfinal_State: -1, URL_of_Anchor: -1, Prefix_Suffix: -1 }]
          })
        });
      } else {
        res = await fetch(endpoint.path, { headers: { Accept: 'application/json' } });
      }
      const data = await res.json();
      setLiveTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setLiveTestResponse(`Error executing request: ${err.message}`);
    } finally {
      setLiveTestingEndpoint(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                FASTAPI & EXPRESS COMPATIBLE
              </span>
              <span className="text-xs text-slate-500 font-mono">Port 3000 (0.0.0.0)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              REST API Endpoints & OpenAPI Documentation
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              All FastAPI endpoints from the original repository (
              <span className="font-mono text-cyan-400">/train</span>,{' '}
              <span className="font-mono text-cyan-400">/predict</span>,{' '}
              <span className="font-mono text-cyan-400">/docs</span>) are fully active and testable with curl, Python requests, or UI.
            </p>
          </div>

          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <span>Open Swagger UI in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Endpoint Cards */}
      <div className="space-y-4">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-md font-mono font-bold ${
                  ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono font-bold text-white text-sm">{ep.path}</span>
                <span className="text-xs text-slate-400 font-medium hidden md:inline">— {ep.title}</span>
              </div>

              <button
                onClick={() => testEndpoint(ep)}
                disabled={liveTestingEndpoint !== null}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded-lg border border-cyan-500/30 transition disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                <span>Test in Console</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">{ep.desc}</p>

            {/* Curl command snippet */}
            <div className="relative bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between overflow-x-auto">
              <code>{ep.curl}</code>
              <button
                onClick={() => copyToClipboard(ep.curl, idx)}
                className="ml-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition shrink-0"
                title="Copy curl"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Response Panel */}
      {liveTestResponse && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Live API Response Inspector
            </h4>
            <button
              onClick={() => setLiveTestResponse(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 max-h-80 overflow-auto scrollbar-thin">
            {liveTestResponse}
          </pre>
        </div>
      )}
    </div>
  );
};
