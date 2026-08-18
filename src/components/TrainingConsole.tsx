import React, { useState, useEffect } from 'react';
import { Cpu, Play, CheckCircle2, Award, Zap, Layers, RefreshCw, BarChart2, Check, ArrowRight, ShieldCheck, Database, Cloud } from 'lucide-react';

interface TrainingConsoleProps {
  onTrainingStart?: () => void;
  onTrainingEnd?: () => void;
}

export const TrainingConsole: React.FC<TrainingConsoleProps> = ({ onTrainingStart, onTrainingEnd }) => {
  const [loading, setLoading] = useState(false);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('Random Forest');

  const fetchModelMetrics = async () => {
    try {
      const res = await fetch('/api/model/metrics');
      const data = await res.json();
      setPipelineData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchModelMetrics();
  }, []);

  const triggerTraining = async () => {
    setLoading(true);
    if (onTrainingStart) onTrainingStart();
    try {
      const res = await fetch('/train?format=json');
      const data = await res.json();
      setPipelineData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      if (onTrainingEnd) onTrainingEnd();
    }
  };

  const currentModelEval = pipelineData?.models_evaluated?.[selectedModel];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                DAGSHUB: Kush-Taneja/networksecurity
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                MLflow Remote Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              Machine Learning Training Pipeline Orchestrator
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Executes the full 4-stage pipeline: Data Ingestion (MongoDB Atlas <span className="font-mono text-cyan-300">cluster0.ycxvelb.mongodb.net</span>) &rarr; Evidently Validation &rarr; Robust Transformation &rarr; Model Trainer Ensemble with MLflow tracking on DagsHub.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="https://dagshub.com/Kush-Taneja/networksecurity/experiments"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
            >
              <span>View on DagsHub</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </a>
            <button
              onClick={triggerTraining}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              <span>{loading ? 'Running Pipeline...' : 'Execute /train Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stage Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              1
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Data Ingestion</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 11,055 Records Split (80/20)
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
              2
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Data Validation</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Drift Test Passed (0 Drift)
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              3
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Data Transformation</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 30 Transformed Features
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              4
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Model Trainer & S3 Sync</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Best: Random Forest (96.3%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      {pipelineData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Models Evaluated Leaderboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Algorithm Evaluation Leaderboard
                </h3>
                <p className="text-xs text-slate-400">Trained with GridSearchCV cross-validation on 8,844 training samples</p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(pipelineData.models_evaluated || {}).map(([name, ev]: [string, any]) => {
                const isSelected = selectedModel === name;
                const isBest = name === pipelineData.best_model_name;
                return (
                  <div
                    key={name}
                    onClick={() => setSelectedModel(name)}
                    className={`cursor-pointer p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-800/80 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isBest ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{name}</span>
                          {isBest && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                              <Award className="w-3 h-3" /> BEST MODEL
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          Params: {JSON.stringify(ev.best_params).replace(/[{}"]/g, '')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Test F1-Score</span>
                        <span className="text-sm font-bold font-mono text-cyan-400">
                          {(ev.test_metric.f1_score * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {(ev.test_metric.accuracy_score * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-slate-500">
                        <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400 translate-x-1' : ''} transition`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Metrics & Confusion Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-1 flex flex-col justify-between">
            {currentModelEval ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Selected Estimator</span>
                    <h4 className="font-bold text-white text-base">{currentModelEval.model_name}</h4>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                    Active
                  </span>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Precision</span>
                    <div className="text-base font-black text-cyan-400 font-mono">
                      {(currentModelEval.test_metric.precision_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Recall</span>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      {(currentModelEval.test_metric.recall_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">F1-Score</span>
                    <div className="text-base font-black text-amber-400 font-mono">
                      {(currentModelEval.test_metric.f1_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Test Accuracy</span>
                    <div className="text-base font-black text-purple-400 font-mono">
                      {(currentModelEval.test_metric.accuracy_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Confusion Matrix */}
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Test Confusion Matrix (2,211 rows):</span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-center text-xs">
                    <div className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg">
                      <span className="text-[10px] text-emerald-400 block">True Positive (Legit)</span>
                      <span className="font-bold text-emerald-300 text-sm">{currentModelEval.test_metric.confusion_matrix.true_positive}</span>
                    </div>
                    <div className="bg-red-950/40 border border-red-800/50 p-2.5 rounded-lg">
                      <span className="text-[10px] text-red-400 block">False Positive</span>
                      <span className="font-bold text-red-300 text-sm">{currentModelEval.test_metric.confusion_matrix.false_positive}</span>
                    </div>
                    <div className="bg-red-950/40 border border-red-800/50 p-2.5 rounded-lg">
                      <span className="text-[10px] text-red-400 block">False Negative</span>
                      <span className="font-bold text-red-300 text-sm">{currentModelEval.test_metric.confusion_matrix.false_negative}</span>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-lg">
                      <span className="text-[10px] text-emerald-400 block">True Negative (Phish)</span>
                      <span className="font-bold text-emerald-300 text-sm">{currentModelEval.test_metric.confusion_matrix.true_negative}</span>
                    </div>
                  </div>
                </div>

                {/* Artifacts location */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>Saved Model: <span className="text-slate-200">final_model/model.pkl</span></div>
                  <div>Preprocessor: <span className="text-slate-200">final_model/preprocessor.pkl</span></div>
                  <div>S3 Syncer: <span className="text-emerald-400">s3://networksecurity-mlops-bucket</span></div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
