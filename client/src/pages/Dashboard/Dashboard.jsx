import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { recentActivity, monthlyUploads, contractTypeDistribution } from '../../data/mockData';
import './Dashboard.css';
import '../App/AppPages.css';

const COLORS = ['#eb5e28', '#252422', '#403d39', '#ccc5b9', '#fca311', '#4a7c59'];

export default function HomePage({ contracts = [], onRefreshContracts }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredContracts = contracts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())
  );

  // Compute stats from user's actual contracts
  const analyzedContracts = contracts.filter(c => c.status === 'Analyzed');
  const dashboardStats = {
    documentsUploaded: contracts.length,
    riskScoreAvg: analyzedContracts.length > 0
      ? Math.round(analyzedContracts.reduce((sum, c) => sum + (c.riskScore || 0), 0) / analyzedContracts.length)
      : 0,
    contractsReviewed: analyzedContracts.length,
    clausesRewritten: analyzedContracts.reduce((sum, c) => sum + (c.clauses || 0), 0),
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Command Center</span>
        <h1>Dashboard.</h1>
      </header>

      {/* SEARCH + NEW ANALYSIS CTA */}
      <div className="dashboard-search-section">
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="Search contracts by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search contracts"
          />
          <button className="search-submit" type="button">Search</button>
        </div>
        <button className="new-analysis-cta" type="button" onClick={() => navigate('/app/upload')}>
          <span>↑</span> New Analysis
        </button>
      </div>

      {/* KEY METRICS */}
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="label">Documents Uploaded</span>
          <div className="metric-value">{dashboardStats.documentsUploaded}</div>
          <div className="metric-desc">Total contracts in your library.</div>
        </div>
        <div className="metric-card risk-critical">
          <span className="label">Avg Risk Score</span>
          <div className="metric-value">{dashboardStats.riskScoreAvg}<span className="metric-sub">/100</span></div>
          <div className="metric-desc">Across all analyzed contracts.</div>
        </div>
        <div className="metric-card">
          <span className="label">Contracts Reviewed</span>
          <div className="metric-value">{dashboardStats.contractsReviewed}</div>
          <div className="metric-desc">Total completed analyses.</div>
        </div>
        <div className="metric-card">
          <span className="label">Clauses Parsed</span>
          <div className="metric-value">{dashboardStats.clausesRewritten}</div>
          <div className="metric-desc">Total clauses processed by AI.</div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate('/app/upload')}>
            <span className="quick-action-icon">↑</span>
            Upload Contract
          </button>
          <button className="quick-action-btn" onClick={() => {
            const first = analyzedContracts[0];
            if (first) navigate(`/app/workspace/${first._id}`);
            else navigate('/app/upload');
          }}>
            <span className="quick-action-icon">⇄</span>
            Compare Versions
          </button>
          <button className="quick-action-btn" onClick={() => {
            const first = analyzedContracts[0];
            if (first) navigate(`/app/workspace/${first._id}`);
            else navigate('/app/upload');
          }}>
            <span className="quick-action-icon">◉</span>
            AI Legal Chat
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/app/knowledge')}>
            <span className="quick-action-icon">⚖</span>
            Knowledge Base
          </button>
        </div>
      </section>

      {/* ANALYTICS OVERVIEW */}
      <section className="dashboard-section">
        <h2>Analytics Overview</h2>
        <div className="charts-grid">
          <div className="chart-wrapper">
            <h4>Monthly Uploads</h4>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyUploads}>
                <XAxis dataKey="month" tick={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }} />
                <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422', boxShadow: '4px 4px 0px #252422' }} />
                <Area type="monotone" dataKey="uploads" stroke="#eb5e28" fill="rgba(235,94,40,0.15)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Contract Types</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={contractTypeDistribution}>
                <XAxis dataKey="type" tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422', boxShadow: '4px 4px 0px #252422' }} />
                <Bar dataKey="count" fill="#252422">
                  {contractTypeDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Risk Distribution</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[
                  { name: 'Critical', value: contracts.filter(c => c.severity === 'CRITICAL').length || 1 },
                  { name: 'High', value: contracts.filter(c => c.severity === 'HIGH').length || 1 },
                  { name: 'Medium', value: contracts.filter(c => c.severity === 'MEDIUM').length || 1 },
                  { name: 'Low', value: contracts.filter(c => c.severity === 'LOW').length || 1 },
                ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  <Cell fill="#eb5e28" />
                  <Cell fill="#403d39" />
                  <Cell fill="#fca311" />
                  <Cell fill="#4a7c59" />
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Risk Score Trend</h4>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={[
                { month: 'Jan', risk: 78 },
                { month: 'Feb', risk: 72 },
                { month: 'Mar', risk: 68 },
                { month: 'Apr', risk: 75 },
                { month: 'May', risk: 64 },
                { month: 'Jun', risk: 71 },
                { month: 'Jul', risk: 72 },
              ]}>
                <XAxis dataKey="month" tick={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }} />
                <YAxis domain={[50, 100]} tick={{ fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422', boxShadow: '4px 4px 0px #252422' }} />
                <Area type="monotone" dataKey="risk" stroke="#252422" fill="rgba(37,36,34,0.1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* RECENT CONTRACTS */}
      <section className="dashboard-section">
        <h2>Recent Contracts</h2>
        {filteredContracts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">◉</span>
            <h3>No Contracts Yet</h3>
            <p>Upload your first contract to get started with AI-powered analysis.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/app/upload')}>
              ↑ Upload Contract
            </button>
          </div>
        ) : (
          <div className="action-table-wrapper">
            <table className="brutalist-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.slice(0, 5).map((c) => (
                  <tr key={c._id} className={c.severity === 'CRITICAL' ? 'row-critical' : ''}>
                    <td style={{ wordBreak: 'break-all' }}>{c.name}</td>
                    <td>{c.type}</td>
                    <td>
                      {c.riskScore !== null ? (
                        <span className={`severity-badge ${(c.severity || '').toLowerCase()}`}>
                          {c.riskScore}/100
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`severity-badge ${c.status === 'Analyzed' ? 'low' : 'medium'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.uploadDate}</td>
                    <td>
                      {c.status === 'Analyzed' && (
                        <button className="btn-small" onClick={() => navigate(`/app/workspace/${c._id}`)}>
                          Open →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RECENT ACTIVITY */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Activity Feed</h2>
        {recentActivity.map((item) => (
          <div key={item.id} className="activity-item">
            <div className="activity-icon">
              {item.type === 'upload' ? '↑' : item.type === 'analysis' ? '◉' : item.type === 'rewrite' ? '✎' : item.type === 'contradiction' ? '⚠' : item.type === 'download' ? '↓' : item.type === 'compare' ? '⇄' : '◈'}
            </div>
            <div>
              <div className="activity-text">
                <strong>{item.action}</strong> — {item.target}
              </div>
              <div className="activity-time">{item.time}</div>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}