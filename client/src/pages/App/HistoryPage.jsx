import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteContract as deleteContractApi } from '../../services/api';
import './AppPages.css';
import '../Dashboard/Dashboard.css';


export default function HistoryPage({ contracts = [], onRefreshContracts }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [deleting, setDeleting] = useState(null);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    setDeleting(id);
    try {
      await deleteContractApi(id);
      onRefreshContracts?.();
    } catch (err) {
      console.error('Failed to delete contract:', err.message);
    } finally {
      setDeleting(null);
    }
  };

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
                  <tr key={c._id} className={c.severity === 'CRITICAL' ? 'row-critical' : ''}>
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
                            <button className="btn-small" onClick={() => navigate(`/app/workspace/${c._id}`)}>View</button>
                            <button className="btn-small" onClick={() => handleDelete(c._id)} disabled={deleting === c._id}>
                              {deleting === c._id ? '...' : '✕'}
                            </button>
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
        <div className="empty-state">
          <span className="empty-state-icon">↓</span>
          <h3>No Exports Yet</h3>
          <p>Exported reports will appear here after you download analysis results.</p>
        </div>
      </section>
    </section>
  );
}
