import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { contracts, clauses, contradictions } from '../../data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const TABS = ['Overview', 'Clauses', 'Contradictions', 'Risk', 'Chat'];

export default function ContractWorkspacePage() {
  const { contractId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const contract = contracts.find(c => c.id === contractId) || contracts[0];

  const riskData = [
    { name: 'Critical', value: 3, color: '#eb5e28' },
    { name: 'High', value: 4, color: '#403d39' },
    { name: 'Medium', value: 2, color: '#fca311' },
    { name: 'Low', value: 1, color: '#4a7c59' },
  ];

  const renderOverview = () => (
    <>
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Risk Score</span>
          <div className="metric-value">{contract.riskScore ?? '—'}<span className="metric-sub">/100</span></div>
          <div className="metric-desc">{contract.severity === 'CRITICAL' ? 'Critical threshold exceeded.' : 'Within acceptable range.'}</div>
        </div>
        <div className="metric-card">
          <span className="label">Clauses</span>
          <div className="metric-value">{contract.clauses ?? '—'}</div>
          <div className="metric-desc">Successfully parsed.</div>
        </div>
        <div className="metric-card">
          <span className="label">Contradictions</span>
          <div className="metric-value">{contract.contradictions ?? '—'}</div>
          <div className="metric-desc">Logical conflicts found.</div>
        </div>
        <div className="metric-card">
          <span className="label">Confidence</span>
          <div className="metric-value">{contract.confidence ?? '—'}<span className="metric-sub">%</span></div>
          <div className="metric-desc">Model certainty level.</div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Document Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span className="label">Filename</span>
            <p style={{ fontWeight: 700, marginTop: '0.5rem', wordBreak: 'break-all' }}>{contract.name}</p>
          </div>
          <div>
            <span className="label">Type</span>
            <p style={{ marginTop: '0.5rem' }}><span className="contract-tag">{contract.type}</span></p>
          </div>
          <div>
            <span className="label">Processing Time</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.5rem', marginTop: '0.5rem' }}>{contract.processingTime ?? '—'}</p>
          </div>
          <div>
            <span className="label">Uploaded</span>
            <p style={{ marginTop: '0.5rem' }}>{contract.uploadDate}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Risk Distribution</h2>
        <div className="charts-grid">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Quick Actions</h4>
            <div className="quick-actions-grid" style={{ marginTop: '0.5rem' }}>
              <button className="quick-action-btn"><span className="quick-action-icon">↓</span> Download Report</button>
              <button className="quick-action-btn"><span className="quick-action-icon">✎</span> Rewrite Clauses</button>
              <button className="quick-action-btn"><span className="quick-action-icon">⇗</span> Share</button>
              <button className="quick-action-btn"><span className="quick-action-icon">⎙</span> Print</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderClauses = () => (
    <section className="dashboard-section" style={{ borderBottom: 'none' }}>
      <h2>All Clauses ({clauses.length})</h2>
      {clauses.map(clause => (
        <div key={clause.id} className={`clause-card risk-indicator-${clause.severity.toLowerCase()}`} style={{ cursor: 'default' }}>
          <div className="clause-card-header">
            <div><strong>§ {clause.number}</strong> — {clause.type}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`severity-badge ${clause.severity.toLowerCase()}`}>{clause.severity}</span>
              <span className="stat-pill">Risk: {clause.riskScore}/100</span>
            </div>
          </div>
          <div className="clause-card-body">
            <p style={{ color: 'var(--charcoal-brown)', fontSize: '0.9rem', marginBottom: '1rem' }}>{clause.text}</p>
            <p><strong>Analysis:</strong> {clause.explanation}</p>
            <p><strong>Recommendation:</strong> {clause.recommendation}</p>
          </div>
          <div className="clause-card-footer">
            <strong>Law:</strong> {clause.relevantLaw}
          </div>
        </div>
      ))}
    </section>
  );

  const renderContradictions = () => (
    <section className="dashboard-section" style={{ borderBottom: 'none' }}>
      <h2>Contradictions ({contradictions.length})</h2>
      {contradictions.map(contra => (
        <div key={contra.id} className="contradiction-card">
          <div style={{ padding: '1rem 1.5rem', borderBottom: '4px solid var(--carbon-black)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <strong>{contra.conflictType}</strong>
            <span className={`severity-badge ${contra.severity.toLowerCase()}`}>{contra.severity}</span>
          </div>
          <div className="contradiction-vs">
            <div className="contradiction-clause">
              <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>§ {contra.clauseA.number}</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{contra.clauseA.text}</p>
            </div>
            <div className="contradiction-vs-badge">VS</div>
            <div className="contradiction-clause">
              <span className="label">§ {contra.clauseB.number}</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{contra.clauseB.text}</p>
            </div>
          </div>
          <div className="contradiction-details">
            <p>{contra.explanation}</p>
            <div style={{ marginTop: '1rem', padding: '1rem', border: '2px solid #4a7c59', backgroundColor: 'rgba(74,124,89,0.05)' }}>
              <strong>Resolution:</strong> {contra.suggestedResolution}
            </div>
          </div>
        </div>
      ))}
    </section>
  );

  const renderRisk = () => (
    <section className="dashboard-section" style={{ borderBottom: 'none' }}>
      <h2>Risk Breakdown</h2>
      <div className="risk-bars">
        {[
          { label: 'Liability', pct: 88, severity: 'critical' },
          { label: 'Non-Compete', pct: 90, severity: 'critical' },
          { label: 'Termination', pct: 75, severity: 'high' },
          { label: 'IP Rights', pct: 72, severity: 'high' },
          { label: 'Data Privacy', pct: 68, severity: 'high' },
          { label: 'Jurisdiction', pct: 52, severity: 'medium' },
          { label: 'Payment', pct: 42, severity: 'medium' },
          { label: 'Confidentiality', pct: 35, severity: 'low' },
        ].map(item => (
          <div key={item.label} className="risk-bar-row">
            <div className="risk-bar-label" style={{ width: 120 }}>{item.label}</div>
            <div className="risk-bar-track">
              <div className={`risk-bar-fill ${item.severity}`} style={{ width: `${item.pct}%` }} />
            </div>
            <div className="risk-bar-pct">{item.pct}%</div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderChat = () => (
    <section className="dashboard-section" style={{ borderBottom: 'none' }}>
      <div className="empty-state">
        <span className="empty-state-icon">◈</span>
        <h3>AI Legal Chat</h3>
        <p style={{ marginBottom: '1rem' }}>Start a conversation about this contract's clauses, risks, and legal implications.</p>
        <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>Open Full Chat →</button>
      </div>
    </section>
  );

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Active Contract — {contract.id}</span>
        <h1>Contract<br/>Workspace.</h1>
      </header>

      <div className="tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && renderOverview()}
      {activeTab === 'Clauses' && renderClauses()}
      {activeTab === 'Contradictions' && renderContradictions()}
      {activeTab === 'Risk' && renderRisk()}
      {activeTab === 'Chat' && renderChat()}
    </section>
  );
}
