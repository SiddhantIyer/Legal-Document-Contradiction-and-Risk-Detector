import React, { useState, useRef } from 'react';
import { clauses } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

export default function ClauseViewerPage() {
  const [selectedClause, setSelectedClause] = useState(null);
  const docRefs = useRef({});

  const handleClauseClick = (clause) => {
    setSelectedClause(clause.id);
    const el = docRefs.current[clause.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'risk-critical';
      case 'HIGH': return 'risk-high';
      case 'MEDIUM': return 'risk-medium';
      case 'LOW': return 'risk-low';
      default: return '';
    }
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Clause Analysis</span>
        <h1>Clause<br/>Viewer.</h1>
      </header>

      <div className="split-layout" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {/* LEFT: DOCUMENT */}
        <div className="split-left">
          <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--carbon-black)' }}>
            <span className="label">Original Document</span>
            <p style={{ fontWeight: 700, marginTop: '0.5rem' }}>SaaS_License_Agreement_v3.2.pdf</p>
          </div>
          <div className="document-viewer">
            <p style={{ marginBottom: '1.5rem', color: 'var(--charcoal-brown)' }}>
              <strong>SAAS LICENSE AGREEMENT</strong><br />
              This Software as a Service License Agreement ("Agreement") is entered into as of July 1, 2026...
            </p>

            {clauses.map((clause) => (
              <div
                key={clause.id}
                ref={el => docRefs.current[clause.id] = el}
                className={`clause-highlight ${getSeverityClass(clause.severity)} ${selectedClause === clause.id ? 'selected' : ''}`}
                onClick={() => setSelectedClause(clause.id)}
                style={selectedClause === clause.id ? { backgroundColor: 'var(--dust-grey)' } : {}}
              >
                <strong>Clause {clause.number} — {clause.type}</strong>
                <br />
                {clause.text}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: AI ANALYSIS */}
        <div className="split-right">
          <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--carbon-black)' }}>
            <span className="label">AI Analysis</span>
            <p style={{ fontWeight: 700, marginTop: '0.5rem' }}>{clauses.length} Clauses Analyzed</p>
          </div>
          <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {clauses.map((clause) => (
              <div
                key={clause.id}
                className={`clause-card risk-indicator-${clause.severity.toLowerCase()} ${selectedClause === clause.id ? 'selected' : ''}`}
                onClick={() => handleClauseClick(clause)}
              >
                <div className="clause-card-header">
                  <div>
                    <strong>§ {clause.number}</strong> — {clause.type}
                  </div>
                  <span className={`severity-badge ${clause.severity.toLowerCase()}`}>
                    {clause.severity}
                  </span>
                </div>
                <div className="clause-card-body">
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span className="stat-pill">Risk: {clause.riskScore}/100</span>
                    <span className="stat-pill">Confidence: {clause.confidence}%</span>
                  </div>
                  <p><strong>Analysis:</strong> {clause.explanation}</p>
                  <p><strong>Recommendation:</strong> {clause.recommendation}</p>
                </div>
                <div className="clause-card-footer">
                  <strong>Relevant Law:</strong> {clause.relevantLaw}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
