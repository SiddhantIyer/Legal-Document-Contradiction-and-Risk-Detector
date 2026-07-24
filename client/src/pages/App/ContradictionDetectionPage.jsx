import React from 'react';
import { contradictions } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

export default function ContradictionDetectionPage() {
  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Conflict Graph</span>
        <h1>Contradiction<br/>Matrix.</h1>
      </header>

      {/* SUMMARY */}
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Total Contradictions</span>
          <div className="metric-value">{contradictions.length}</div>
          <div className="metric-desc">Logical conflicts detected in clause graph.</div>
        </div>
        <div className="metric-card">
          <span className="label">Critical</span>
          <div className="metric-value">{contradictions.filter(c => c.severity === 'CRITICAL').length}</div>
          <div className="metric-desc">Require immediate resolution.</div>
        </div>
        <div className="metric-card">
          <span className="label">High</span>
          <div className="metric-value">{contradictions.filter(c => c.severity === 'HIGH').length}</div>
          <div className="metric-desc">Significant risk exposure.</div>
        </div>
        <div className="metric-card">
          <span className="label">Medium</span>
          <div className="metric-value">{contradictions.filter(c => c.severity === 'MEDIUM').length}</div>
          <div className="metric-desc">Should be reviewed.</div>
        </div>
      </section>

      {/* CONTRADICTION CARDS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Detected Conflicts</h2>

        {contradictions.map((contra) => (
          <div key={contra.id} className="contradiction-card">
            {/* CONFLICT TYPE HEADER */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '4px solid var(--carbon-black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="label" style={{ marginBottom: '0.25rem' }}>{contra.id}</span>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem' }}>
                  {contra.conflictType}
                </div>
              </div>
              <span className={`severity-badge ${contra.severity.toLowerCase()}`}>
                {contra.severity}
              </span>
            </div>

            {/* CLAUSE A vs CLAUSE B */}
            <div className="contradiction-vs">
              <div className="contradiction-clause">
                <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>Clause {contra.clauseA.number}</span>
                <h4 style={{ borderBottom: 'none', marginTop: '0.5rem' }}>{contra.clauseA.type}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-brown)' }}>{contra.clauseA.text}</p>
              </div>

              <div className="contradiction-vs-badge">VS</div>

              <div className="contradiction-clause">
                <span className="label">Clause {contra.clauseB.number}</span>
                <h4 style={{ borderBottom: 'none', marginTop: '0.5rem' }}>{contra.clauseB.type}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-brown)' }}>{contra.clauseB.text}</p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="contradiction-details">
              <div style={{ marginBottom: '1rem' }}>
                <span className="label">Conflict Analysis</span>
                <p style={{ marginTop: '0.5rem' }}>{contra.explanation}</p>
              </div>
              <div style={{ padding: '1rem', border: '2px solid var(--carbon-black)', backgroundColor: 'rgba(74, 124, 89, 0.08)' }}>
                <span className="label" style={{ color: '#4a7c59', borderColor: '#4a7c59' }}>Suggested Resolution</span>
                <p style={{ marginTop: '0.5rem' }}>{contra.suggestedResolution}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}
