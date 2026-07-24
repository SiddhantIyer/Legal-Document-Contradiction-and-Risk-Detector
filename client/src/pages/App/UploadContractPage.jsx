import React, { useState, useRef, useCallback } from 'react';
import { contracts } from '../../data/mockData';
import '../App/AppPages.css';
import '../Dashboard/Dashboard.css';

export default function UploadContractPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

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

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Ingestion Pipeline</span>
        <h1>Upload<br/>Contract.</h1>
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
        <section className="dashboard-section">
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
                {file.status === 'uploaded' && (
                  <button className="btn-small">Analyze</button>
                )}
                <button className="btn-small" onClick={() => removeFile(file.id)}>Remove</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* RECENT UPLOADS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Recent Uploads</h2>
        <div className="action-table-wrapper">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Document</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ wordBreak: 'break-all' }}>{c.name}</td>
                  <td>{c.type}</td>
                  <td>{c.uploadDate}</td>
                  <td>
                    <span className={`severity-badge ${c.status === 'Analyzed' ? 'low' : 'medium'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
