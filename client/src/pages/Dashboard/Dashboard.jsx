import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { dashboardStats, recentActivity, monthlyUploads, contractTypeDistribution, contracts } from '../../data/mockData';
import './Dashboard.css';
import '../App/AppPages.css';

const COLORS = ['#eb5e28', '#252422', '#403d39', '#ccc5b9', '#fca311', '#4a7c59'];

export default function HomePage() {
  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Command Center</span>
        <h1>Dashboard.</h1>
      </header>

      {/* KEY METRICS */}
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="label">Documents Uploaded</span>
          <div className="metric-value">{dashboardStats.documentsUploaded}</div>
          <div className="metric-desc">Total contracts in system corpus.</div>
        </div>
        <div className="metric-card risk-critical">
          <span className="label">Active Analyses</span>
          <div className="metric-value">{dashboardStats.activeAnalyses}</div>
          <div className="metric-desc">Currently in processing pipeline.</div>
        </div>
        <div className="metric-card">
          <span className="label">Avg Risk Score</span>
          <div className="metric-value">{dashboardStats.riskScoreAvg}<span className="metric-sub">/100</span></div>
          <div className="metric-desc">Across all analyzed contracts.</div>
        </div>
        <div className="metric-card">
          <span className="label">Contracts Reviewed</span>
          <div className="metric-value">{dashboardStats.contractsReviewed}</div>
          <div className="metric-desc">Total completed analyses.</div>
        </div>
      </section>

      {/* CHARTS */}
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
                  { name: 'Critical', value: 35 },
                  { name: 'High', value: 30 },
                  { name: 'Medium', value: 25 },
                  { name: 'Low', value: 10 },
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

      {/* QUICK ACTIONS */}
      <section className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn">
            <span className="quick-action-icon">↑</span>
            Upload Contract
          </button>
          <button className="quick-action-btn">
            <span className="quick-action-icon">⇄</span>
            Compare Versions
          </button>
          <button className="quick-action-btn">
            <span className="quick-action-icon">◉</span>
            AI Legal Chat
          </button>
          <button className="quick-action-btn">
            <span className="quick-action-icon">⚖</span>
            Knowledge Base
          </button>
        </div>
      </section>

      {/* RECENT CONTRACTS */}
      <section className="dashboard-section">
        <h2>Recent Contracts</h2>
        <div className="action-table-wrapper">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Document</th>
                <th>Type</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.slice(0, 5).map((c) => (
                <tr key={c.id} className={c.severity === 'CRITICAL' ? 'row-critical' : ''}>
                  <td>{c.id}</td>
                  <td style={{ wordBreak: 'break-all' }}>{c.name}</td>
                  <td>{c.type}</td>
                  <td>
                    {c.riskScore !== null ? (
                      <span className={`severity-badge ${(c.severity || '').toLowerCase()}`}>
                        {c.riskScore}/100
                      </span>
                    ) : '—'}
                  </td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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