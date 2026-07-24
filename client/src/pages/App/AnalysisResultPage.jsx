import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { contracts, clauses, contradictions, riskCategories } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const contract = contracts[0];
const riskData = [
  { name: 'Critical', value: 3, color: '#eb5e28' },
  { name: 'High', value: 4, color: '#403d39' },
  { name: 'Medium', value: 2, color: '#fca311' },
  { name: 'Low', value: 1, color: '#4a7c59' },
];

export default function AnalysisResultPage() {
  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Analysis Report</span>
        <h1>Risk<br/>Assessment.</h1>
      </header>

      {/* SUMMARY METRICS */}
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Overall Risk Score</span>
          <div className="metric-value">{contract.riskScore}<span className="metric-sub">/100</span></div>
          <div className="risk-meter">
            <div className="risk-meter-needle" style={{ left: `${contract.riskScore}%` }} />
          </div>
          <div className="risk-meter-labels">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
        <div className="metric-card">
          <span className="label">AI Confidence</span>
          <div className="metric-value">{contract.confidence}<span className="metric-sub">%</span></div>
          <div className="metric-desc">Model certainty in analysis accuracy.</div>
        </div>
        <div className="metric-card">
          <span className="label">Clauses Parsed</span>
          <div className="metric-value">{contract.clauses}</div>
          <div className="metric-desc">Successfully mapped to taxonomy.</div>
        </div>
        <div className="metric-card">
          <span className="label">Contradictions</span>
          <div className="metric-value">{contract.contradictions}</div>
          <div className="metric-desc">Logical conflicts in graph.</div>
        </div>
      </section>

      {/* DOCUMENT INFO */}
      <section className="dashboard-section">
        <h2>Document Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <span className="label">Document</span>
            <p style={{ wordBreak: 'break-all', fontWeight: 700, marginTop: '0.5rem' }}>{contract.name}</p>
          </div>
          <div>
            <span className="label">Contract Type</span>
            <p style={{ marginTop: '0.5rem' }}><span className="contract-tag">{contract.type}</span></p>
          </div>
          <div>
            <span className="label">Processing Time</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.5rem', marginTop: '0.5rem' }}>{contract.processingTime}</p>
          </div>
          <div>
            <span className="label">Upload Date</span>
            <p style={{ marginTop: '0.5rem' }}>{contract.uploadDate}</p>
          </div>
        </div>
      </section>

      {/* RISK BREAKDOWN */}
      <section className="dashboard-section">
        <h2>Risk Breakdown</h2>
        <div className="charts-grid">
          <div className="chart-wrapper">
            <h4>Severity Distribution</h4>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Risk Categories</h4>
            <div className="risk-bars">
              {riskCategories.slice(0, 6).map((cat) => (
                <div key={cat.name} className="risk-bar-row">
                  <div className="risk-bar-label" style={{ width: 120 }}>{cat.name}</div>
                  <div className="risk-bar-track">
                    <div
                      className={`risk-bar-fill ${cat.score >= 80 ? 'critical' : cat.score >= 60 ? 'high' : cat.score >= 40 ? 'medium' : 'low'}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <div className="risk-bar-pct">{cat.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CRITICAL CLAUSES */}
      <section className="dashboard-section">
        <h2>Critical Findings</h2>
        {clauses.filter(c => c.severity === 'CRITICAL').map((clause) => (
          <div key={clause.id} className={`clause-card risk-indicator-${clause.severity.toLowerCase()}`}>
            <div className="clause-card-header">
              <div>
                <strong>Clause {clause.number}</strong> — {clause.type}
              </div>
              <span className={`severity-badge ${clause.severity.toLowerCase()}`}>
                {clause.severity} • {clause.riskScore}/100
              </span>
            </div>
            <div className="clause-card-body">
              <p><strong>Finding:</strong> {clause.explanation}</p>
              <p><strong>Recommendation:</strong> {clause.recommendation}</p>
            </div>
            <div className="clause-card-footer">
              <strong>Relevant Law:</strong> {clause.relevantLaw}
            </div>
          </div>
        ))}
      </section>

      {/* ACTIONS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Export & Share</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
            ↓ Download Report
          </button>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--carbon-black)' }}>
            ⇗ Share Report
          </button>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--charcoal-brown)' }}>
            ⎙ Print Report
          </button>
        </div>
      </section>
    </section>
  );
}
