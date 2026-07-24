import React, { useState } from 'react';
import { versionDiffData } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

export default function CompareContractsPage() {
  const [activeTab, setActiveTab] = useState('changes');
  const { version1, version2, changes, riskDifference } = versionDiffData;

  const getChangeIcon = (type) => {
    switch (type) {
      case 'added': return '+';
      case 'deleted': return '−';
      case 'modified': return '~';
      default: return '•';
    }
  };

  const getChangeClass = (type) => {
    switch (type) {
      case 'added': return 'diff-added';
      case 'deleted': return 'diff-deleted';
      case 'modified': return 'diff-modified';
      default: return '';
    }
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Version Diffing</span>
        <h1>Compare<br/>Contracts.</h1>
      </header>

      {/* VERSION SUMMARY */}
      <div className="split-layout">
        <div className="split-left" style={{ padding: '1.5rem' }}>
          <span className="label">Version 1 — Base</span>
          <h3 style={{ wordBreak: 'break-all', marginTop: '0.5rem' }}>{version1.name}</h3>
          <p className="file-card-meta" style={{ marginTop: '0.5rem' }}>
            {version1.date} • {version1.clauses} clauses • Risk: {version1.riskScore}/100
          </p>
          <div className="risk-meter" style={{ marginTop: '1rem' }}>
            <div className="risk-meter-needle" style={{ left: `${version1.riskScore}%` }} />
          </div>
        </div>
        <div className="split-right" style={{ padding: '1.5rem' }}>
          <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>Version 2 — Redline</span>
          <h3 style={{ wordBreak: 'break-all', marginTop: '0.5rem' }}>{version2.name}</h3>
          <p className="file-card-meta" style={{ marginTop: '0.5rem' }}>
            {version2.date} • {version2.clauses} clauses • Risk: {version2.riskScore}/100
          </p>
          <div className="risk-meter" style={{ marginTop: '1rem' }}>
            <div className="risk-meter-needle" style={{ left: `${version2.riskScore}%` }} />
          </div>
        </div>
      </div>

      {/* RISK DIFFERENCE SUMMARY */}
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Overall Risk Change</span>
          <div className="metric-value">+{riskDifference.overall}</div>
          <div className="metric-desc">Risk score increased from v1 to v2.</div>
        </div>
        <div className="metric-card">
          <span className="label">New Critical</span>
          <div className="metric-value">+{riskDifference.critical}</div>
          <div className="metric-desc">Additional critical issues.</div>
        </div>
        <div className="metric-card">
          <span className="label">New High</span>
          <div className="metric-value">+{riskDifference.high}</div>
          <div className="metric-desc">Additional high-risk clauses.</div>
        </div>
        <div className="metric-card">
          <span className="label">Total Changes</span>
          <div className="metric-value">{changes.length}</div>
          <div className="metric-desc">Clauses added, deleted, or modified.</div>
        </div>
      </section>

      {/* TABS */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'changes' ? 'active' : ''}`} onClick={() => setActiveTab('changes')}>
          All Changes ({changes.length})
        </button>
        <button className={`tab-btn ${activeTab === 'added' ? 'active' : ''}`} onClick={() => setActiveTab('added')}>
          Added ({changes.filter(c => c.type === 'added').length})
        </button>
        <button className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`} onClick={() => setActiveTab('deleted')}>
          Deleted ({changes.filter(c => c.type === 'deleted').length})
        </button>
        <button className={`tab-btn ${activeTab === 'modified' ? 'active' : ''}`} onClick={() => setActiveTab('modified')}>
          Modified ({changes.filter(c => c.type === 'modified').length})
        </button>
      </div>

      {/* CHANGE CARDS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        {changes
          .filter(c => activeTab === 'changes' || c.type === activeTab)
          .map((change) => (
            <div key={change.id} className="clause-card" style={{ cursor: 'default' }}>
              <div className="clause-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--carbon-black)',
                    backgroundColor: change.type === 'added' ? '#4a7c59' : change.type === 'deleted' ? 'var(--spicy-paprika)' : '#fca311',
                    color: change.type === 'modified' ? 'var(--carbon-black)' : 'var(--floral-white)',
                  }}>
                    {getChangeIcon(change.type)}
                  </span>
                  <div>
                    <strong>Clause {change.clause}</strong> — {change.label}
                    <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-brown)', textTransform: 'uppercase' }}>
                      {change.type}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`severity-badge ${change.severity.toLowerCase()}`}>{change.severity}</span>
                  <span className={`stat-pill ${change.riskChange > 0 ? 'negative' : 'positive'}`}>
                    {change.riskChange > 0 ? '+' : ''}{change.riskChange} Risk
                  </span>
                </div>
              </div>
              <div className="clause-card-body">
                {change.v1Text && (
                  <div className={change.type === 'deleted' ? 'diff-deleted' : 'diff-modified'}>
                    <span className="label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>V1 — Original</span>
                    <p style={{ marginTop: '0.25rem' }}>{change.v1Text}</p>
                  </div>
                )}
                {change.v2Text && (
                  <div className={change.type === 'added' ? 'diff-added' : change.type === 'modified' ? 'diff-added' : ''}>
                    <span className="label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', color: '#4a7c59', borderColor: '#4a7c59' }}>V2 — Redline</span>
                    <p style={{ marginTop: '0.25rem' }}>{change.v2Text}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </section>
    </section>
  );
}
