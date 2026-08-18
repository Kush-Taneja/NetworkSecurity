import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Download, CheckCircle, AlertTriangle, Play, RefreshCw, Filter, FileSpreadsheet, Eye } from 'lucide-react';

export const BatchPredictor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [samplePresets, setSamplePresets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<'all' | 'phishing' | 'legitimate'>('all');
  const [showRawHtml, setShowRawHtml] = useState(false);

  useEffect(() => {
    fetch('/api/sample-data')
      .then(res => res.json())
      .then(data => {
        if (data.samples) setSamplePresets(data.samples);
      })
      .catch(console.error);

    // Run default batch sample on mount
    runSampleBatch();
  }, []);

  const runSampleBatch = async () => {
    setLoading(true);
    try {
      // 12 test rows matching original valid_data/test.csv
      const defaultRows = [
        { having_IP_Address: 1, URL_Length: -1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: 1, SSLfinal_State: 1, Domain_registeration_length: 1, Favicon: 1, port: 1, HTTPS_token: -1, Request_URL: -1, URL_of_Anchor: 1, Links_in_tags: 1, SFH: 0, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: 1, DNSRecord: 1, web_traffic: -1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 1, Statistical_report: 1 },
        { having_IP_Address: -1, URL_Length: -1, Shortining_Service: -1, having_At_Symbol: 1, double_slash_redirecting: -1, Prefix_Suffix: 1, having_Sub_Domain: 1, SSLfinal_State: 1, Domain_registeration_length: -1, Favicon: 1, port: 1, HTTPS_token: -1, Request_URL: 1, URL_of_Anchor: 1, Links_in_tags: 0, SFH: 1, Submitting_to_email: 1, Abnormal_URL: -1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: -1, DNSRecord: -1, web_traffic: 1, Page_Rank: 1, Google_Index: -1, Links_pointing_to_page: 1, Statistical_report: 1 },
        { having_IP_Address: -1, URL_Length: -1, Shortining_Service: -1, having_At_Symbol: 1, double_slash_redirecting: -1, Prefix_Suffix: -1, having_Sub_Domain: 0, SSLfinal_State: 0, Domain_registeration_length: 1, Favicon: 1, port: 1, HTTPS_token: -1, Request_URL: -1, URL_of_Anchor: -1, Links_in_tags: 1, SFH: -1, Submitting_to_email: 1, Abnormal_URL: -1, Redirect: 1, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: 1, DNSRecord: 1, web_traffic: -1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: -1, URL_Length: -1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: 1, SSLfinal_State: 1, Domain_registeration_length: 1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: -1, URL_of_Anchor: 0, Links_in_tags: 1, SFH: 1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: 1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 1, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: 1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: 0, SSLfinal_State: -1, Domain_registeration_length: -1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: 1, URL_of_Anchor: 0, Links_in_tags: 0, SFH: 1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: -1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: -1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: 1, having_Sub_Domain: 0, SSLfinal_State: -1, Domain_registeration_length: -1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: 1, URL_of_Anchor: 0, Links_in_tags: 0, SFH: -1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: 1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: 1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: 0, SSLfinal_State: 1, Domain_registeration_length: -1, Favicon: -1, port: 1, HTTPS_token: 1, Request_URL: 1, URL_of_Anchor: 0, Links_in_tags: -1, SFH: 1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: -1, RightClick: 1, popUpWidnow: -1, Iframe: 1, age_of_domain: -1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: -1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: -1, SSLfinal_State: -1, Domain_registeration_length: 1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: -1, URL_of_Anchor: -1, Links_in_tags: 0, SFH: -1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: -1, DNSRecord: -1, web_traffic: -1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: -1, Shortining_Service: 1, having_At_Symbol: -1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: -1, SSLfinal_State: 1, Domain_registeration_length: 1, Favicon: -1, port: -1, HTTPS_token: 1, Request_URL: -1, URL_of_Anchor: 0, Links_in_tags: 0, SFH: 0, Submitting_to_email: -1, Abnormal_URL: 1, Redirect: 0, on_mouseover: -1, RightClick: 1, popUpWidnow: -1, Iframe: -1, age_of_domain: 1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: 1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: 0, SSLfinal_State: -1, Domain_registeration_length: -1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: 1, URL_of_Anchor: -1, Links_in_tags: 0, SFH: 1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: -1, DNSRecord: -1, web_traffic: -1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: 1, URL_Length: -1, Shortining_Service: 1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: -1, SSLfinal_State: 1, Domain_registeration_length: 1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: -1, URL_of_Anchor: 0, Links_in_tags: -1, SFH: -1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: 1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
        { having_IP_Address: -1, URL_Length: 1, Shortining_Service: -1, having_At_Symbol: 1, double_slash_redirecting: 1, Prefix_Suffix: -1, having_Sub_Domain: 0, SSLfinal_State: 1, Domain_registeration_length: -1, Favicon: 1, port: 1, HTTPS_token: 1, Request_URL: 1, URL_of_Anchor: 0, Links_in_tags: 1, SFH: -1, Submitting_to_email: 1, Abnormal_URL: 1, Redirect: 0, on_mouseover: 1, RightClick: 1, popUpWidnow: 1, Iframe: 1, age_of_domain: 1, DNSRecord: 1, web_traffic: 1, Page_Rank: -1, Google_Index: 1, Links_pointing_to_page: 0, Statistical_report: 1 },
      ];

      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: defaultRows }),
      });
      const data = await response.json();
      setResultsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData,
      });
      const data = await response.json();
      setResultsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsvOutput = () => {
    if (!resultsData?.csvOutput) return;
    const blob = new Blob([resultsData.csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prediction_output.csv';
    link.click();
  };

  const filteredRows = resultsData?.enrichedRows?.filter((row: any) => {
    const isPhishing = row.predicted_column === '0.0' || row.predicted_column === 0 || row.predicted_column === -1;
    if (filterClass === 'phishing' && !isPhishing) return false;
    if (filterClass === 'legitimate' && isPhishing) return false;
    if (searchTerm) {
      return Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Upload Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              Batch CSV Inference Engine (FastAPI /predict)
            </h2>
            <p className="text-sm text-slate-400">
              Upload multi-row network traffic or phishing dataset CSV files to classify each sample as Legitimate (1.0) or Phishing (0.0).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runSampleBatch}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Load Valid Test CSV (12 Rows)</span>
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/60 rounded-xl p-6 text-center transition">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-200">
              {selectedFile ? selectedFile.name : 'Select or drag & drop network security CSV dataset'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Accepts CSV with the 30 schema features</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="mt-3 inline-block cursor-pointer px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition"
            >
              Browse CSV File
            </label>
          </div>

          <div className="flex justify-end gap-3">
            {selectedFile && (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Run Batch Classification</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Summary KPI Cards */}
      {resultsData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Total Evaluated Records</span>
            <div className="text-2xl font-black text-white mt-1">{resultsData.summary.total}</div>
            <span className="text-[11px] text-slate-500">Full CSV dataset rows</span>
          </div>
          <div className="bg-slate-900 border border-red-950/40 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-red-950/20">
            <span className="text-xs text-red-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Phishing Threat Count
            </span>
            <div className="text-2xl font-black text-red-400 mt-1">
              {resultsData.summary.phishing_count}{' '}
              <span className="text-xs font-normal text-red-300">({resultsData.summary.phishing_percentage}%)</span>
            </div>
            <span className="text-[11px] text-red-400/70">{resultsData.summary.critical_count} critical severity</span>
          </div>
          <div className="bg-slate-900 border border-emerald-950/40 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/20">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Legitimate Verified
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{resultsData.summary.legitimate_count}</div>
            <span className="text-[11px] text-emerald-400/70">Safe network records</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Mean Threat Index</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">{resultsData.summary.avg_risk_score} / 100</div>
            <span className="text-[11px] text-slate-500">Calibrated risk score</span>
          </div>
        </div>
      )}

      {/* Results Table Section */}
      {resultsData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base">Inference Output Data Table</h3>
              <p className="text-xs text-slate-400">
                Features appended with <span className="font-mono text-cyan-400">predicted_column</span> (1.0 = Legitimate, 0.0 = Phishing)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search values..."
                className="bg-slate-950 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
              />

              {/* Class Filter */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterClass('all')}
                  className={`text-xs px-2.5 py-1 rounded-md ${filterClass === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                >
                  All ({resultsData.enrichedRows?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterClass('phishing')}
                  className={`text-xs px-2.5 py-1 rounded-md ${filterClass === 'phishing' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-400'}`}
                >
                  Phishing
                </button>
                <button
                  type="button"
                  onClick={() => setFilterClass('legitimate')}
                  className={`text-xs px-2.5 py-1 rounded-md ${filterClass === 'legitimate' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
                >
                  Legitimate
                </button>
              </div>

              {/* Toggle HTML view */}
              <button
                type="button"
                onClick={() => setShowRawHtml(!showRawHtml)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showRawHtml ? 'Interactive Table' : 'FastAPI table.html View'}</span>
              </button>

              {/* Download CSV */}
              <button
                type="button"
                onClick={downloadCsvOutput}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          {showRawHtml ? (
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
              <div dangerouslySetInnerHTML={{ __html: resultsData.tableHtml }} />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[550px] border border-slate-800 rounded-xl scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="p-3 bg-slate-950">#</th>
                    <th className="p-3 bg-slate-950 text-cyan-300">predicted_column</th>
                    <th className="p-3 bg-slate-950">threat_level</th>
                    <th className="p-3 bg-slate-950">risk_score</th>
                    <th className="p-3 bg-slate-950">SSLfinal_State</th>
                    <th className="p-3 bg-slate-950">URL_of_Anchor</th>
                    <th className="p-3 bg-slate-950">having_Sub_Domain</th>
                    <th className="p-3 bg-slate-950">Prefix_Suffix</th>
                    <th className="p-3 bg-slate-950">having_IP_Address</th>
                    <th className="p-3 bg-slate-950">URL_Length</th>
                    <th className="p-3 bg-slate-950">SFH</th>
                    <th className="p-3 bg-slate-950">web_traffic</th>
                    <th className="p-3 bg-slate-950">Google_Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredRows.map((row: any, i: number) => {
                    const isPhishing = row.predicted_column === '0.0' || row.predicted_column === 0 || row.predicted_column === -1;
                    return (
                      <tr key={i} className={`hover:bg-slate-800/60 transition ${isPhishing ? 'bg-red-950/15' : 'bg-slate-900/30'}`}>
                        <td className="p-3 text-slate-500 font-mono">{i + 1}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-black ${
                              !isPhishing
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {row.predicted_column} ({!isPhishing ? 'Legitimate' : 'Phishing'})
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[11px] font-semibold ${isPhishing ? 'text-red-400' : 'text-emerald-400'}`}>
                            {row.threat_level || (isPhishing ? 'High' : 'Low')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{row.risk_score}</td>
                        <td className={`p-3 ${row.SSLfinal_State === -1 || row.SSLfinal_State === '-1' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                          {row.SSLfinal_State}
                        </td>
                        <td className={`p-3 ${row.URL_of_Anchor === -1 || row.URL_of_Anchor === '-1' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                          {row.URL_of_Anchor}
                        </td>
                        <td className={`p-3 ${row.having_Sub_Domain === -1 || row.having_Sub_Domain === '-1' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                          {row.having_Sub_Domain}
                        </td>
                        <td className={`p-3 ${row.Prefix_Suffix === -1 || row.Prefix_Suffix === '-1' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                          {row.Prefix_Suffix}
                        </td>
                        <td className="p-3 text-slate-300">{row.having_IP_Address}</td>
                        <td className="p-3 text-slate-300">{row.URL_Length}</td>
                        <td className="p-3 text-slate-300">{row.SFH}</td>
                        <td className="p-3 text-slate-300">{row.web_traffic}</td>
                        <td className="p-3 text-slate-300">{row.Google_Index}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
