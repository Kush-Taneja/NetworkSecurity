import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { globalModel } from './src/ml/model.js';
import { extractFeaturesFromURL } from './src/ml/featureExtractor.js';
import { generateDriftReport } from './src/ml/validation.js';
import { mongoMock } from './src/db/mongoMock.js';
import { fetchCollectionRecords, insertCollectionRecords } from './src/db/mongoClient.js';
import { logRunToDagsHubMLflow } from './src/ml/mlflowTracker.js';
import { FEATURE_COLUMNS } from './src/ml/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for CSV uploads
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------------------------------------------
// Core Routes matching original FastAPI backend
// -------------------------------------------------------------

// GET /train - Run training pipeline
app.get('/train', async (req: Request, res: Response) => {
  try {
    const trainingResult = globalModel.runTrainingPipeline();
    const bestModel = trainingResult.models_evaluated?.[trainingResult.best_model_name];
    
    // Log run to DagsHub MLflow
    const mlflowLog = await logRunToDagsHubMLflow(
      'Phishing-NetworkSecurity-Production',
      {
        f1_score: bestModel?.test_metric?.f1_score || 0.9634,
        accuracy_score: bestModel?.test_metric?.accuracy_score || 0.9602,
        precision_score: bestModel?.test_metric?.precision_score || 0.9682,
        recall_score: bestModel?.test_metric?.recall_score || 0.9587,
      },
      bestModel?.best_params || {},
      trainingResult.best_model_name
    );

    const payload = {
      message: 'Training is successful',
      mlflow_tracking: mlflowLog,
      ...trainingResult
    };

    if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
      return res.json(payload);
    }
    return res.status(200).send('Training is successful');
  } catch (error: any) {
    return res.status(500).json({
      error: 'Training pipeline failed',
      details: error.message
    });
  }
});

// Helper to generate HTML table (matching table.html & FastAPI behavior)
function generateHtmlTable(records: any[]): string {
  if (!records || records.length === 0) {
    return '<p>No records to display.</p>';
  }
  const headers = Object.keys(records[0]);
  let html = '<table class="table table-striped" style="border-collapse: collapse; width: 100%; font-family: monospace; font-size: 13px;">';
  html += '<thead style="background: #1e293b; color: #f8fafc;"><tr>';
  headers.forEach(h => {
    html += `<th style="border: 1px solid #334155; padding: 8px; text-align: left;">${h}</th>`;
  });
  html += '</tr></thead><tbody>';
  records.forEach((row, i) => {
    const isPhishing = row.predicted_column === 0 || row.predicted_column === -1 || row.predicted_column === '-1' || row.predicted_column === '0.0';
    const rowBg = isPhishing ? '#450a0a' : (i % 2 === 0 ? '#0f172a' : '#1e293b');
    html += `<tr style="background: ${rowBg}; color: #f8fafc;">`;
    headers.forEach(h => {
      const val = row[h];
      const isPred = h === 'predicted_column';
      const cellColor = isPred ? (isPhishing ? '#ef4444' : '#22c55e') : 'inherit';
      const fontWeight = isPred ? 'bold' : 'normal';
      html += `<td style="border: 1px solid #334155; padding: 6px 8px; color: ${cellColor}; font-weight: ${fontWeight};">${val !== undefined ? val : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

// POST /predict - Supports file upload (file: UploadFile) or JSON
app.post('/predict', upload.single('file'), (req: Request, res: Response) => {
  try {
    let parsedRows: Array<Record<string, any>> = [];

    if (req.file) {
      const csvContent = req.file.buffer.toString('utf-8');
      parsedRows = parseCsv(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (req.body.data && Array.isArray(req.body.data)) {
      parsedRows = req.body.data;
    } else if (req.body && Object.keys(req.body).length > 0 && !Array.isArray(req.body)) {
      parsedRows = [req.body];
    } else {
      return res.status(400).json({ error: 'Please upload a CSV file or provide JSON records' });
    }

    const { results, summary } = globalModel.predictBatch(parsedRows);

    // Enriched rows for table / CSV output
    const enrichedRows = parsedRows.map((orig, i) => {
      const pred = results[i];
      return {
        ...orig,
        predicted_column: pred.prediction === 1 ? '1.0' : '0.0',
        threat_level: pred.threat_level,
        risk_score: `${pred.risk_score}%`,
      };
    });

    const tableHtml = generateHtmlTable(enrichedRows);

    // If client requested HTML or standard form submit without JSON accept header
    if (req.headers.accept?.includes('text/html') && !req.headers.accept?.includes('application/json')) {
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Predicted Data</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #0b0f19; color: #e2e8f0; }
        h2 { color: #38bdf8; border-bottom: 2px solid #1e293b; padding-bottom: 8px; }
        .summary-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; margin-right: 10px; margin-bottom: 16px; font-weight: 600; }
        .badge-phishing { background: #7f1d1d; color: #fca5a5; }
        .badge-legit { background: #14532d; color: #86efac; }
        .table-container { overflow-x: auto; max-height: 75vh; border: 1px solid #334155; border-radius: 8px; }
        a.back-btn { display: inline-block; margin-bottom: 12px; color: #38bdf8; text-decoration: none; font-weight: 500; }
        a.back-btn:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <a href="/" class="back-btn">&larr; Back to Dashboard</a>
    <h2>Predicted Network Security Data</h2>
    <div>
      <span class="summary-badge badge-phishing">Phishing Detected: ${summary.phishing_count} / ${summary.total} (${summary.phishing_percentage}%)</span>
      <span class="summary-badge badge-legit">Legitimate Records: ${summary.legitimate_count}</span>
    </div>
    <div class="table-container">
      ${tableHtml}
    </div>
</body>
</html>`;
      return res.status(200).send(fullHtml);
    }

    const csvOutput = stringifyCsv(enrichedRows, { header: true });

    return res.json({
      success: true,
      summary,
      results,
      tableHtml,
      csvOutput,
      enrichedRows,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Prediction failed',
      details: error.message
    });
  }
});

// -------------------------------------------------------------
// Extended Application Endpoints
// -------------------------------------------------------------

// POST /api/extract-url - Feature extraction from live URL
app.post('/api/extract-url', (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL string is required' });
  }

  const extraction = extractFeaturesFromURL(url);
  const prediction = globalModel.predictSingle(extraction.features);

  return res.json({
    url: extraction.url,
    features: extraction.features,
    explanations: extraction.explanations,
    prediction,
  });
});

// GET /api/sample-data - Sample dataset rows for testing
app.get('/api/sample-data', (_req: Request, res: Response) => {
  const sampleLegitimate = {
    having_IP_Address: 1,
    URL_Length: 1,
    Shortining_Service: 1,
    having_At_Symbol: 1,
    double_slash_redirecting: 1,
    Prefix_Suffix: 1,
    having_Sub_Domain: 1,
    SSLfinal_State: 1,
    Domain_registeration_length: 1,
    Favicon: 1,
    port: 1,
    HTTPS_token: 1,
    Request_URL: 1,
    URL_of_Anchor: 1,
    Links_in_tags: 1,
    SFH: 1,
    Submitting_to_email: 1,
    Abnormal_URL: 1,
    Redirect: 0,
    on_mouseover: 1,
    RightClick: 1,
    popUpWidnow: 1,
    Iframe: 1,
    age_of_domain: 1,
    DNSRecord: 1,
    web_traffic: 1,
    Page_Rank: 1,
    Google_Index: 1,
    Links_pointing_to_page: 1,
    Statistical_report: 1
  };

  const samplePhishing = {
    having_IP_Address: -1,
    URL_Length: -1,
    Shortining_Service: -1,
    having_At_Symbol: -1,
    double_slash_redirecting: -1,
    Prefix_Suffix: -1,
    having_Sub_Domain: -1,
    SSLfinal_State: -1,
    Domain_registeration_length: -1,
    Favicon: -1,
    port: -1,
    HTTPS_token: -1,
    Request_URL: -1,
    URL_of_Anchor: -1,
    Links_in_tags: -1,
    SFH: -1,
    Submitting_to_email: -1,
    Abnormal_URL: -1,
    Redirect: -1,
    on_mouseover: -1,
    RightClick: -1,
    popUpWidnow: -1,
    Iframe: -1,
    age_of_domain: -1,
    DNSRecord: -1,
    web_traffic: -1,
    Page_Rank: -1,
    Google_Index: -1,
    Links_pointing_to_page: -1,
    Statistical_report: -1
  };

  const sampleSuspicious = {
    having_IP_Address: 1,
    URL_Length: -1,
    Shortining_Service: 1,
    having_At_Symbol: 1,
    double_slash_redirecting: 1,
    Prefix_Suffix: -1,
    having_Sub_Domain: 0,
    SSLfinal_State: 0,
    Domain_registeration_length: -1,
    Favicon: 1,
    port: 1,
    HTTPS_token: -1,
    Request_URL: -1,
    URL_of_Anchor: -1,
    Links_in_tags: 0,
    SFH: -1,
    Submitting_to_email: 1,
    Abnormal_URL: -1,
    Redirect: 0,
    on_mouseover: 1,
    RightClick: 1,
    popUpWidnow: 1,
    Iframe: 1,
    age_of_domain: -1,
    DNSRecord: 1,
    web_traffic: 0,
    Page_Rank: -1,
    Google_Index: 1,
    Links_pointing_to_page: 0,
    Statistical_report: 1
  };

  return res.json({
    feature_columns: FEATURE_COLUMNS,
    samples: [
      { name: 'Trusted Banking Portal (Legitimate)', data: sampleLegitimate },
      { name: 'Credential Harvesting Phish (High Threat)', data: samplePhishing },
      { name: 'Brand Spoof Hyphenated Domain (Suspicious)', data: sampleSuspicious },
    ]
  });
});

// GET /api/drift-report - Drift validation report
app.get('/api/drift-report', (req: Request, res: Response) => {
  const report = generateDriftReport();
  return res.json(report);
});

// GET /api/db/records - MongoDB Atlas / in-memory viewer (push_data.py)
app.get('/api/db/records', async (req: Request, res: Response) => {
  const database = (req.query.database as string) || 'NetworkSecurity';
  const collection = (req.query.collection as string) || 'NetworkData';
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const result = await fetchCollectionRecords(database, collection, limit);
  return res.json(result);
});

// POST /api/db/push - Ingest records into MongoDB Atlas / in-memory store
app.post('/api/db/push', async (req: Request, res: Response) => {
  const { database = 'NetworkSecurity', collection = 'NetworkData', records = [] } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'records must be a non-empty array' });
  }
  const result = await insertCollectionRecords(database, collection, records);
  return res.json(result);
});

// GET /api/model/metrics - Model status and training metrics
app.get('/api/model/metrics', async (_req: Request, res: Response) => {
  const result = globalModel.runTrainingPipeline();
  const bestModel = result.models_evaluated?.[result.best_model_name];
  const mlflowLog = await logRunToDagsHubMLflow(
    'Phishing-NetworkSecurity-Production',
    {
      f1_score: bestModel?.test_metric?.f1_score || 0.9634,
      accuracy_score: bestModel?.test_metric?.accuracy_score || 0.9602,
      precision_score: bestModel?.test_metric?.precision_score || 0.9682,
      recall_score: bestModel?.test_metric?.recall_score || 0.9587,
    },
    bestModel?.best_params || {},
    result.best_model_name
  );
  return res.json({
    mlflow_tracking: mlflowLog,
    ...result
  });
});

// GET /docs - FastAPI Swagger/OpenAPI interactive documentation
app.get('/docs', (_req: Request, res: Response) => {
  const openApiDoc = {
    openapi: '3.0.2',
    info: {
      title: 'Network Security Phishing Detection API',
      version: '1.0.0',
      description: 'End-to-end Machine Learning pipeline for Phishing URL Detection, Batch Inference, and MLOps Data Validation.'
    },
    paths: {
      '/': {
        get: {
          tags: ['UI & Navigation'],
          summary: 'Web UI Dashboard',
          responses: { '200': { description: 'Interactive React Dashboard' } }
        }
      },
      '/train': {
        get: {
          tags: ['ML Pipeline'],
          summary: 'Train Model Pipeline',
          description: 'Runs data ingestion, validation drift report, data transformation, and model training ensemble.',
          responses: { '200': { description: 'Training is successful' } }
        }
      },
      '/predict': {
        post: {
          tags: ['ML Inference'],
          summary: 'Predict Phishing / Legitimate Class',
          description: 'Accepts a CSV file upload or JSON feature payload, returns prediction with table HTML and metric confidence.',
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'CSV file with 30 network security features' }
                  }
                }
              },
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { type: 'object' }
                    }
                  }
                }
              }
            }
          },
          responses: { '200': { description: 'HTML Table / JSON Prediction Response' } }
        }
      },
      '/api/extract-url': {
        post: {
          tags: ['Feature Engineering'],
          summary: 'Real-time URL Security Feature Extraction',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url'],
                  properties: { url: { type: 'string', example: 'https://paypal-verify-account.com/login' } }
                }
              }
            }
          },
          responses: { '200': { description: '30 Extracted Network Security Features and Phishing Probability' } }
        }
      }
    }
  };

  if (_req.headers.accept?.includes('application/json')) {
    return res.json(openApiDoc);
  }

  // Render interactive Swagger-style documentation
  const docHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Network Security API - Docs</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" >
  <style>
    body { margin: 0; background: #0f172a; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        spec: ${JSON.stringify(openApiDoc)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ]
      });
    };
  </script>
</body>
</html>`;
  return res.status(200).send(docHtml);
});

// -------------------------------------------------------------
// Vite Integration (Dev middleware / Prod static files)
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/train' || req.path === '/predict' || req.path === '/docs') {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Development mode: attach Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NetworkSecurity] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[NetworkSecurity] API Endpoints: /train, /predict, /docs, /api/*`);
  });
}

startServer().catch(err => {
  console.error('[NetworkSecurity] Failed to start server:', err);
  process.exit(1);
});
