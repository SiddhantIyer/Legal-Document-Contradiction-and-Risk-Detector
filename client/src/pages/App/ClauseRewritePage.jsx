import React, { useState } from 'react';
import { clauses } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const MODES = ['Conservative', 'Balanced', 'Market Standard'];

export default function ClauseRewritePage() {
  const [selectedClause, setSelectedClause] = useState(clauses[0]);
  const [mode, setMode] = useState(1); // 0=Conservative, 1=Balanced, 2=Market Standard
  const [accepted, setAccepted] = useState({});
  const [copied, setCopied] = useState(false);

  const riskReduction = [15, 35, 52][mode];

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedClause.rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccept = () => {
    setAccepted(prev => ({ ...prev, [selectedClause.id]: true }));
  };

  const handleRegenerate = () => {
    // In a real app this would call the API; here we just toggle to show interaction
    setAccepted(prev => ({ ...prev, [selectedClause.id]: false }));
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Clause Redliner</span>
        <h1>Clause<br/>Rewrite.</h1>
      </header>

      {/* CLAUSE SELECTOR */}
      <section className="dashboard-section">
        <h2>Select Clause</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {clauses.filter(c => c.riskScore >= 40).map((clause) => (
            <button
              key={clause.id}
              className={`filter-tag ${selectedClause.id === clause.id ? 'active' : ''}`}
              onClick={() => setSelectedClause(clause)}
            >
              § {clause.number} — {clause.type}
              {accepted[clause.id] && ' ✓'}
            </button>
          ))}
        </div>
      </section>

      {/* ORIGINAL CLAUSE */}
      <section className="dashboard-section">
        <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>Original Clause</span>
        <h3 style={{ marginTop: '0.5rem' }}>§ {selectedClause.number} — {selectedClause.type}</h3>
        <div style={{ padding: '1.5rem', border: '2px solid var(--carbon-black)', marginTop: '1rem', backgroundColor: 'rgba(235,94,40,0.05)', borderLeft: '6px solid var(--spicy-paprika)' }}>
          <p>{selectedClause.text}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span className={`severity-badge ${selectedClause.severity.toLowerCase()}`}>
            {selectedClause.severity}
          </span>
          <span className="stat-pill negative">Risk: {selectedClause.riskScore}/100</span>
          <span className="stat-pill">Confidence: {selectedClause.confidence}%</span>
        </div>
      </section>

      {/* REWRITE MODE SLIDER */}
      <section className="dashboard-section">
        <span className="label">Rewrite Mode</span>
        <div className="brutalist-slider-container" style={{ marginTop: '1rem', maxWidth: '500px' }}>
          <input
            type="range"
            className="brutalist-slider"
            min={0}
            max={2}
            step={1}
            value={mode}
            onChange={(e) => setMode(Number(e.target.value))}
            aria-label="Rewrite mode selector"
          />
          <div className="slider-labels">
            {MODES.map((m, i) => (
              <span key={m} style={{ fontWeight: mode === i ? 900 : 400, color: mode === i ? 'var(--spicy-paprika)' : 'inherit' }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AI SUGGESTED REWRITE */}
      <section className="dashboard-section">
        <span className="label" style={{ color: '#4a7c59', borderColor: '#4a7c59' }}>AI Suggested Rewrite</span>
        <div style={{ padding: '1.5rem', border: '2px solid var(--carbon-black)', marginTop: '1rem', backgroundColor: 'rgba(74,124,89,0.05)', borderLeft: '6px solid #4a7c59' }}>
          <p>{selectedClause.rewrite}</p>
        </div>

        {/* REASON */}
        <div style={{ marginTop: '1.5rem' }}>
          <span className="label">Reason for Rewrite</span>
          <p style={{ marginTop: '0.5rem' }}>{selectedClause.explanation}</p>
        </div>

        {/* RISK REDUCTION */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="label" style={{ marginBottom: 0 }}>Expected Risk Reduction</span>
          <span className="stat-pill positive">
            −{riskReduction} points → {Math.max(selectedClause.riskScore - riskReduction, 10)}/100
          </span>
        </div>

        {/* RELEVANT LAW */}
        <div style={{ marginTop: '1.5rem' }}>
          <span className="label">Legal Basis</span>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{selectedClause.relevantLaw}</p>
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }} onClick={handleCopy}>
            {copied ? '✓ Copied' : '⎘ Copy Rewrite'}
          </button>
          <button
            className="btn-primary"
            style={{
              fontSize: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: accepted[selectedClause.id] ? '#4a7c59' : 'var(--carbon-black)',
            }}
            onClick={handleAccept}
          >
            {accepted[selectedClause.id] ? '✓ Accepted' : '✓ Accept Rewrite'}
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--charcoal-brown)' }}
            onClick={handleRegenerate}
          >
            ↻ Regenerate
          </button>
        </div>
      </section>
    </section>
  );
}
