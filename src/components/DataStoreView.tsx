import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Upload, FileCode, CheckCircle } from 'lucide-react';

export const DataStoreView: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isAtlas, setIsAtlas] = useState<boolean>(false);
  const [clusterInfo, setClusterInfo] = useState<string>('cluster0.ycxvelb.mongodb.net');
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/records?database=NetworkSecurity&collection=NetworkData');
      const data = await res.json();
      setRecords(data.records || []);
      setTotalCount(data.totalCount || 0);
      setIsAtlas(Boolean(data.isAtlas));
      if (data.cluster) setClusterInfo(data.cluster);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const pushTestRecords = async () => {
    setLoading(true);
    setPushStatus(null);
    try {
      const newSamples = [
        {
          having_IP_Address: 1,
          URL_Length: -1,
          Shortining_Service: 1,
          having_At_Symbol: 1,
          double_slash_redirecting: 1,
          Prefix_Suffix: -1,
          having_Sub_Domain: 1,
          SSLfinal_State: 1,
          Domain_registeration_length: 1,
          Favicon: 1,
          port: 1,
          HTTPS_token: -1,
          Request_URL: -1,
          URL_of_Anchor: 1,
          Links_in_tags: 1,
          SFH: 0,
          Submitting_to_email: 1,
          Abnormal_URL: 1,
          Redirect: 0,
          on_mouseover: 1,
          RightClick: 1,
          popUpWidnow: 1,
          Iframe: 1,
          age_of_domain: 1,
          DNSRecord: 1,
          web_traffic: -1,
          Page_Rank: -1,
          Google_Index: 1,
          Links_pointing_to_page: 1,
          Statistical_report: 1,
          Result: 1,
          ingestion_source: 'push_data.py',
          inserted_at: new Date().toISOString()
        }
      ];

      const res = await fetch('/api/db/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: 'NetworkSecurity',
          collection: 'NetworkData',
          records: newSamples
        })
      });
      const data = await res.json();
      if (data.success) {
        setPushStatus(`Successfully inserted ${data.insertedCount} record(s) into ${data.isAtlas ? 'MongoDB Atlas' : 'data store'}.`);
        fetchRecords();
      }
    } catch (err: any) {
      setPushStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                MONGODB ATLAS CONNECTED
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                Cluster: {clusterInfo}
              </span>
              <span className="text-xs text-slate-400 font-mono">DB: NetworkSecurity | Coll: NetworkData</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-400" />
              Network Feature Store & Ingestion Pipeline (push_data.py)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Stores raw network features from <span className="font-mono text-cyan-400">Network_Data/phisingData.csv</span> into your MongoDB Atlas cluster (<span className="font-mono text-cyan-300">cluster0.ycxvelb.mongodb.net</span>) before DataIngestion feeds the training pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={pushTestRecords}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Simulate push_data.py ETL</span>
            </button>
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refresh records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {pushStatus && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pushStatus}</span>
          </div>
        )}
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">MongoDB Database</span>
          <div className="text-lg font-bold text-white mt-1 font-mono">NetworkSecurity</div>
          <span className="text-[11px] text-slate-500">Target database name</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Target Collection</span>
          <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">NetworkData</div>
          <span className="text-[11px] text-slate-500">Collection for training ingestion</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Stored Records Count</span>
          <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">{totalCount}</div>
          <span className="text-[11px] text-slate-500">Active documents</span>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Raw Ingested Documents (NetworkSecurity.NetworkData)</h3>

        <div className="overflow-x-auto max-h-[500px] border border-slate-800 rounded-xl scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-3">_id</th>
                <th className="p-3">Result (Target)</th>
                <th className="p-3">having_IP_Address</th>
                <th className="p-3">URL_Length</th>
                <th className="p-3">Prefix_Suffix</th>
                <th className="p-3">having_Sub_Domain</th>
                <th className="p-3">SSLfinal_State</th>
                <th className="p-3">URL_of_Anchor</th>
                <th className="p-3">web_traffic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-cyan-400">{r._id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${r.Result === 1 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {r.Result === 1 ? '1 (Legitimate)' : '-1 (Phishing)'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{r.having_IP_Address}</td>
                  <td className="p-3 text-slate-300">{r.URL_Length}</td>
                  <td className="p-3 text-slate-300">{r.Prefix_Suffix}</td>
                  <td className="p-3 text-slate-300">{r.having_Sub_Domain}</td>
                  <td className="p-3 text-slate-300">{r.SSLfinal_State}</td>
                  <td className="p-3 text-slate-300">{r.URL_of_Anchor}</td>
                  <td className="p-3 text-slate-300">{r.web_traffic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
