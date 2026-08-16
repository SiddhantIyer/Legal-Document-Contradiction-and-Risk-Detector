import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contracts } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const exportHistory = [
  { file: 'SaaS_Risk_Report.pdf', date: '2026-07-24', format: 'PDF', size: '2.4 MB' },
  { file: 'Employment_Analysis.pdf', date: '2026-07-22', format: 'PDF', size: '1.8 MB' },
  { file: 'NDA_Summary.csv', date: '2026-07-20', format: 'CSV', size: '0.3 MB' },
  { file: 'Vendor_Clause_Report.pdf', date: '2026-07-18', format: 'PDF', size: '3.1 MB' },
];

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  const filtered = contracts
    .filter(c => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate);
      if (sortBy === 'risk') return (b.riskScore || 0) - (a.riskScore || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Historical Data</span>
        <h1>Analysis<br/>History.</h1>
      </header>

      {/* SEARCH & FILTERS */}
      <section className="dashboard-section">
        <div className="search-bar" style={{ marginBottom: '1rem' }}>
          <input
            className="search-input"
            placeholder="Search contracts by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search history"
          />
          <button className="search-submit">Search</button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-tags" style={{ marginBottom: 0 }}>
            {['ALL', 'Analyzed', 'Processing'].map(s => (
              <button key={s} className={`filter-tag ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.85rem' }}>
              <option value="date">Sort by Date</option>
              <option value="risk">Sort by Risk</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="dashboard-section">
        <div style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          {filtered.length} {filtered.length === 1 ? 'contract' : 'contracts'} found
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">◉</span>
            <h3>No Results</h3>
            <p>No contracts match your search criteria.</p>
          </div>
        ) : (
          <div className="action-table-wrapper">
            <table className="brutalist-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Upload Date</th>
                  <th>Risk Score</th>
                  <th>Severity</th>
                  <th>Clauses</th>
                  <th>Contradictions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className={c.severity === 'CRITICAL' ? 'row-critical' : ''}>
                    <td>{c.id}</td>
                    <td style={{ wordBreak: 'break-all', maxWidth: '200px' }}>{c.name}</td>
                    <td>{c.type}</td>
                    <td>{c.uploadDate}</td>
                    <td>
                      {c.riskScore !== null ? (
                        <strong>{c.riskScore}/100</strong>
                      ) : '—'}
                    </td>
                    <td>
                      {c.severity ? (
                        <span className={`severity-badge ${c.severity.toLowerCase()}`}>{c.severity}</span>
                      ) : '—'}
                    </td>
                    <td>{c.clauses ?? '—'}</td>
                    <td>{c.contradictions ?? '—'}</td>
                    <td>
                      <span className={`severity-badge ${c.status === 'Analyzed' ? 'low' : 'medium'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {c.status === 'Analyzed' && (
                          <>
                            <button className="btn-small" onClick={() => navigate(`/app/workspace/${c.id}`)}>View</button>
                            <button className="btn-small">↓</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* EXPORT HISTORY */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Export History</h2>
        {exportHistory.map((exp, i) => (
          <div key={i} className="file-card">
            <div className="file-card-info">
              <span className="file-card-name">{exp.file}</span>
              <span className="file-card-meta">{exp.format} • {exp.size} • {exp.date}</span>
            </div>
            <button className="btn-small">↓ Download</button>
          </div>
        ))}
      </section>
    </section>
  );
}
