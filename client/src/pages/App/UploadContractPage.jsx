import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App/AppPages.css';
import '../Dashboard/Dashboard.css';

const ANALYSIS_STEPS = [
  { id: 1, label: 'Extracting text...' },
  { id: 2, label: 'Detecting clauses...' },
  { id: 3, label: 'Checking contradictions...' },
  { id: 4, label: 'Running legal AI...' },
  { id: 5, label: 'Generating report...' },
];

export default function UploadContractPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  const getFileTypeLabel = (type) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('word') || type.includes('document')) return 'DOCX';
    if (type.includes('image')) return 'IMAGE';
    return 'FILE';
  };

  const handleFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList)
      .filter(f => validTypes.includes(f.type) || f.name.match(/\.(pdf|docx|jpg|jpeg|png)$/i))
      .map(f => ({
        id: `FILE_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        status: 'ready',
        uploadedAt: new Date().toISOString(),
      }));

    if (newFiles.length === 0) return;

    setFiles(prev => [...newFiles, ...prev]);

    // Mock upload for first file
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
  };

  // Analysis step progression
  useEffect(() => {
    if (!analyzing) return;

    if (analysisStep >= ANALYSIS_STEPS.length) {
      setAnalysisProgress(100);
      // Navigate to workspace after short delay
      const timer = setTimeout(() => {
        navigate('/app/workspace/CTR_001');
      }, 800);
      return () => clearTimeout(timer);
    }

    setAnalysisProgress(Math.round((analysisStep / ANALYSIS_STEPS.length) * 100));

    const timer = setTimeout(() => {
      setAnalysisStep(prev => prev + 1);
    }, 1400 + Math.random() * 600);

    return () => clearTimeout(timer);
  }, [analyzing, analysisStep, navigate]);

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
                  {analysisStep >= ANALYSIS_STEPS.length ? 'Analysis Complete' : `Step ${analysisStep + 1} of ${ANALYSIS_STEPS.length}`}
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
              accept=".pdf,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
            <span className="upload-zone-icon">↑</span>
            <h3>Drop Contract Here</h3>
            <p>Drag & drop your PDF, DOCX, or scanned image — or click to browse.</p>
            <button className="upload-btn-inline" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Select File
            </button>
          </div>

          {/* SUPPORTED FORMATS */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <span className="contract-tag">PDF</span>
            <span className="contract-tag">DOCX</span>
            <span className="contract-tag">JPG</span>
            <span className="contract-tag">PNG</span>
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
                    {getFileTypeLabel(file.type)} • {formatSize(file.size)} • {file.status === 'uploaded' ? 'Uploaded ✓' : 'Ready'}
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
