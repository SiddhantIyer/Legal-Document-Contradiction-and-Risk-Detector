import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadContract } from '../../services/api';
import '../App/AppPages.css';
import '../Dashboard/Dashboard.css';

const ANALYSIS_STEPS = [
  { id: 1, label: 'Uploading document...' },
  { id: 2, label: 'Extracting text...' },
  { id: 3, label: 'Detecting clauses & entities...' },
  { id: 4, label: 'Running legal AI analysis...' },
  { id: 5, label: 'Generating report...' },
];

export default function UploadContractPage({ onRefreshContracts }) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);       // { id, name, size, type, status, uploadedAt }
  const [rawFiles, setRawFiles] = useState({});  // id -> actual File object
  const [uploading, setUploading] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState(null);
  const [apiDone, setApiDone] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validExtensions = /\.(pdf|docx)$/i;

  const getFileTypeLabel = (name) => {
    if (name.match(/\.pdf$/i)) return 'PDF';
    if (name.match(/\.docx$/i)) return 'DOCX';
    return 'FILE';
  };

  const handleFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList)
      .filter(f => validExtensions.test(f.name))
      .map(f => ({
        id: `FILE_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        status: 'ready',
        uploadedAt: new Date().toISOString(),
        _rawFile: f, // Keep reference to the actual File object
      }));

    if (newFiles.length === 0) return;

    // Store raw File objects by ID
    const newRawMap = {};
    newFiles.forEach(f => { newRawMap[f.id] = f._rawFile; });
    setRawFiles(prev => ({ ...prev, ...newRawMap }));

    // Store file metadata (without the raw File)
    setFiles(prev => [...newFiles.map(({ _rawFile, ...meta }) => meta), ...prev]);

    // Simulate upload progress for the first file
    const file = newFiles[0];
    setUploading(file.id);
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'uploaded' } : f));
        setTimeout(() => {
          setUploading(null);
          setProgress(0);
        }, 500);
      }
      setProgress(Math.min(p, 100));
    }, 300);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setRawFiles(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisProgress(0);
    setAnalysisError(null);
    setApiDone(false);
    setApiResult(null);

    // Find the uploaded file and send it to the real API
    const uploadedFileMeta = files.find(f => f.status === 'uploaded');
    if (!uploadedFileMeta) return;

    const rawFile = rawFiles[uploadedFileMeta.id];
    if (!rawFile) return;

    // Fire the real API call in the background
    uploadContract(rawFile)
      .then((result) => {
        setApiResult(result);
        setApiDone(true);
      })
      .catch((err) => {
        console.error('Upload/analysis failed:', err.message);
        setAnalysisError(err.message);
        setAnalyzing(false);
      });
  };

  // Analysis step progression (visual animation)
  useEffect(() => {
    if (!analyzing) return;

    // If all steps are done AND the API is done, navigate
    if (analysisStep >= ANALYSIS_STEPS.length) {
      setAnalysisProgress(100);

      if (apiDone && apiResult) {
        const timer = setTimeout(() => {
          onRefreshContracts?.();
          navigate(`/app/workspace/${apiResult.contract._id}`);
        }, 600);
        return () => clearTimeout(timer);
      }

      // If steps are done but API isn't, wait for API
      return;
    }

    setAnalysisProgress(Math.round((analysisStep / ANALYSIS_STEPS.length) * 100));

    // Pace the animation steps — slow enough for real API to finish
    const timer = setTimeout(() => {
      setAnalysisStep(prev => prev + 1);
    }, 2500 + Math.random() * 1500);

    return () => clearTimeout(timer);
  }, [analyzing, analysisStep, apiDone, apiResult, navigate, onRefreshContracts]);

  // If API finishes while steps are still going, that's fine — let steps catch up.
  // If API finishes AFTER steps, navigate immediately.
  useEffect(() => {
    if (apiDone && apiResult && analysisStep >= ANALYSIS_STEPS.length && analyzing) {
      const timer = setTimeout(() => {
        onRefreshContracts?.();
        navigate(`/app/workspace/${apiResult.contract._id}`);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [apiDone, apiResult, analysisStep, analyzing, navigate, onRefreshContracts]);

  const getStepStatus = (index) => {
    if (index < analysisStep) return 'complete';
    if (index === analysisStep && analysisStep < ANALYSIS_STEPS.length) return 'active';
    return 'pending';
  };

  const hasUploadedFiles = files.some(f => f.status === 'uploaded');

  return (
    <>
      {/* FULLSCREEN ANALYSIS OVERLAY */}
      {analyzing && (
        <div className="analysis-overlay">
          <div className="analysis-overlay-inner">
            <span className="label">Processing Pipeline</span>
            <h2>Analyzing<br/>Contract.</h2>

            <div className="analysis-overlay-progress">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  {analysisStep >= ANALYSIS_STEPS.length
                    ? (apiDone ? 'Analysis Complete' : 'Finalizing...')
                    : `Step ${analysisStep + 1} of ${ANALYSIS_STEPS.length}`}
                </span>
                <span style={{ fontWeight: 900, fontFamily: 'Inter, sans-serif', fontSize: '1.25rem' }}>
                  {analysisProgress}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${analysisProgress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>

            <div className="analysis-overlay-steps">
              {ANALYSIS_STEPS.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div key={step.id} className={`analysis-overlay-step ${status}`}>
                    <div className="analysis-overlay-step-icon">
                      {status === 'complete' ? '✓' : status === 'active' ? '◉' : step.id}
                    </div>
                    <span className="analysis-overlay-step-label">{step.label}</span>
                    <span className="analysis-overlay-step-status">
                      {status === 'complete' ? 'Done' : status === 'active' ? 'Processing...' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <section className="dashboard-main">
        <header className="dashboard-header">
          <span className="label">Ingestion Pipeline</span>
          <h1>New<br/>Analysis.</h1>
        </header>

        {/* ERROR MESSAGE */}
        {analysisError && (
          <section className="dashboard-section">
            <div style={{ padding: '1rem', border: '2px solid var(--spicy-paprika)', backgroundColor: 'rgba(235,94,40,0.05)' }}>
              <strong>Error:</strong> {analysisError}
            </div>
          </section>
        )}

        {/* UPLOAD ZONE */}
        <section className="dashboard-section">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload document drop zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
            <span className="upload-zone-icon">↑</span>
            <h3>Drop Contract Here</h3>
            <p>Drag & drop your PDF or DOCX — or click to browse.</p>
            <button className="upload-btn-inline" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Select File
            </button>
          </div>

          {/* SUPPORTED FORMATS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <span className="contract-tag">PDF</span>
            <span className="contract-tag">DOCX</span>
          </div>
        </section>

        {/* UPLOAD PROGRESS */}
        {uploading && (
          <section className="dashboard-section">
            <span className="label">Processing</span>
            <h3 style={{ marginTop: '0.5rem' }}>Uploading Document...</h3>
            <div className="progress-bar-container" style={{ marginTop: '1rem' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              <span className="progress-bar-label">{Math.round(progress)}%</span>
            </div>
          </section>
        )}

        {/* UPLOADED FILES */}
        {files.length > 0 && (
          <section className="dashboard-section" style={{ borderBottom: 'none' }}>
            <h2>Staged Files</h2>
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-card-info">
                  <span className="file-card-name">{file.name}</span>
                  <span className="file-card-meta">
                    {getFileTypeLabel(file.name)} • {formatSize(file.size)} • {file.status === 'uploaded' ? 'Uploaded ✓' : 'Ready'}
                  </span>
                </div>
                <div className="file-card-actions">
                  <button className="btn-small" onClick={() => removeFile(file.id)}>Remove</button>
                </div>
              </div>
            ))}

            {/* ANALYZE BUTTON */}
            {hasUploadedFiles && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                  className="btn-primary"
                  style={{ fontSize: '1.25rem', padding: '1rem 3rem' }}
                  onClick={startAnalysis}
                >
                  ◉ Analyze Contract
                </button>
              </div>
            )}
          </section>
        )}
      </section>
    </>
  );
}

