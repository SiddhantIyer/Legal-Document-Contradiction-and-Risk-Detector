import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { riskCategories, riskTimeline, contracts } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const severityData = [
  { name: 'Critical', value: 12, color: '#eb5e28' },
  { name: 'High', value: 18, color: '#403d39' },
  { name: 'Medium', value: 24, color: '#fca311' },
  { name: 'Low', value: 14, color: '#4a7c59' },
];

const radarData = riskCategories.map(c => ({ subject: c.name, score: c.score, fullMark: 100 }));

export default function RiskDashboardPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filteredContracts = activeFilter === 'ALL'
    ? contracts.filter(c => c.severity)
    : contracts.filter(c => c.severity === activeFilter);

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Risk Intelligence</span>
        <h1>Risk<br/>Dashboard.</h1>
      </header>

      {/* OVERVIEW METRICS */}
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Avg Risk Score</span>
          <div className="metric-value">72<span className="metric-sub">/100</span></div>
          <div className="metric-desc">Across all analyzed contracts.</div>
        </div>
        <div className="metric-card">
          <span className="label">Critical Flags</span>
          <div className="metric-value">12</div>
          <div className="metric-desc">Require immediate action.</div>
        </div>
        <div className="metric-card">
          <span className="label">High Risk</span>
          <div className="metric-value">18</div>
          <div className="metric-desc">Significant exposure detected.</div>
        </div>
        <div className="metric-card">
          <span className="label">Resolved</span>
          <div className="metric-value">31</div>
          <div className="metric-desc">Issues addressed via rewrite.</div>
        </div>
      </section>

      {/* CHARTS */}
      <section className="dashboard-section">
        <h2>Risk Analytics</h2>
        <div className="charts-grid">
          <div className="chart-wrapper">
            <h4>Severity Distribution</h4>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Risk by Category</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskCategories} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
                <Bar dataKey="score" fill="#252422">
                  {riskCategories.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 80 ? '#eb5e28' : entry.score >= 60 ? '#403d39' : entry.score >= 40 ? '#fca311' : '#4a7c59'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Risk Timeline</h4>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={riskTimeline}>
                <XAxis dataKey="date" tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[40, 100]} tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
                <Area type="monotone" dataKey="avgRisk" stroke="#eb5e28" fill="rgba(235,94,40,0.1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrapper">
            <h4>Risk Radar</h4>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ccc5b9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontFamily: 'Space Mono', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar dataKey="score" stroke="#eb5e28" fill="rgba(235,94,40,0.2)" fillOpacity={0.6} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* FILTERED TABLE */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Contract Risk Table</h2>
        <div className="filter-tags">
          {filters.map(f => (
            <button
              key={f}
              className={`filter-tag ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="action-table-wrapper">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Contract</th>
                <th>Type</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Contradictions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(c => (
                <tr key={c.id} className={c.severity === 'CRITICAL' ? 'row-critical' : ''}>
                  <td>{c.id}</td>
                  <td style={{ wordBreak: 'break-all' }}>{c.name}</td>
                  <td>{c.type}</td>
                  <td><strong>{c.riskScore}/100</strong></td>
                  <td>
                    <span className={`severity-badge ${c.severity.toLowerCase()}`}>{c.severity}</span>
                  </td>
                  <td>{c.contradictions}</td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No contracts match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
