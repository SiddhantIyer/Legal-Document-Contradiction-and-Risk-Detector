import React, { useState } from 'react';
import { currentUser, contracts } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const TABS = ['Profile', 'Security', 'Notifications', 'Saved Reports', 'Export History', 'Subscription'];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [profile, setProfile] = useState({ ...currentUser });
  const [notifSettings, setNotifSettings] = useState({
    analysisComplete: true,
    highRisk: true,
    weeklyDigest: false,
    marketing: false,
  });

  const toggleNotif = (key) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <div className="profile-grid">
            <div className="profile-sidebar-card">
              <div className="profile-avatar">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>{profile.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)' }}>{profile.email}</p>
              <div style={{ marginTop: '1rem' }}>
                <span className="contract-tag">{profile.role}</span>
              </div>
            </div>
            <div>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={profile.company} onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', alignSelf: 'flex-start' }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'Security':
        return (
          <div className="settings-form">
            <h3>Change Password</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Confirm new password" />
            </div>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', alignSelf: 'flex-start' }}>
              Update Password
            </button>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '4px solid var(--carbon-black)' }}>
              <h3>Two-Factor Authentication</h3>
              <div className="toggle-row">
                <div>
                  <div className="toggle-label">Enable 2FA</div>
                  <div className="toggle-desc">Add an extra layer of security to your account.</div>
                </div>
                <div className="toggle-switch">
                  <div className="toggle-switch-knob" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '4px solid var(--carbon-black)' }}>
              <h3>Active Sessions</h3>
              <div className="file-card">
                <div className="file-card-info">
                  <span className="file-card-name">Current Session</span>
                  <span className="file-card-meta">Windows • Chrome • Last active: Now</span>
                </div>
                <span className="severity-badge low">Active</span>
              </div>
            </div>
          </div>
        );

      case 'Notifications':
        return (
          <div style={{ maxWidth: '600px' }}>
            <h3>Notification Preferences</h3>
            {[
              { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Get notified when contract analysis finishes.' },
              { key: 'highRisk', label: 'High Risk Alerts', desc: 'Immediate alerts for critical risk findings.' },
              { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of all analyses.' },
              { key: 'marketing', label: 'Product Updates', desc: 'Updates about new features and improvements.' },
            ].map(item => (
              <div key={item.key} className="toggle-row">
                <div>
                  <div className="toggle-label">{item.label}</div>
                  <div className="toggle-desc">{item.desc}</div>
                </div>
                <div className={`toggle-switch ${notifSettings[item.key] ? 'on' : ''}`} onClick={() => toggleNotif(item.key)}>
                  <div className="toggle-switch-knob" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'Saved Reports':
        return (
          <div>
            <div className="action-table-wrapper">
              <table className="brutalist-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Risk Score</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.filter(c => c.status === 'Analyzed').map(c => (
                    <tr key={c.id}>
                      <td style={{ wordBreak: 'break-all' }}>{c.name}</td>
                      <td>{c.type}</td>
                      <td><span className={`severity-badge ${(c.severity || '').toLowerCase()}`}>{c.riskScore}/100</span></td>
                      <td>{c.uploadDate}</td>
                      <td><button className="btn-small">Download</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Export History':
        return (
          <div>
            {[
              { file: 'SaaS_Risk_Report.pdf', date: '2026-07-24', format: 'PDF', size: '2.4 MB' },
              { file: 'Employment_Analysis.pdf', date: '2026-07-22', format: 'PDF', size: '1.8 MB' },
              { file: 'NDA_Summary.csv', date: '2026-07-20', format: 'CSV', size: '0.3 MB' },
              { file: 'Vendor_Clause_Report.pdf', date: '2026-07-18', format: 'PDF', size: '3.1 MB' },
            ].map((exp, i) => (
              <div key={i} className="file-card">
                <div className="file-card-info">
                  <span className="file-card-name">{exp.file}</span>
                  <span className="file-card-meta">{exp.format} • {exp.size} • {exp.date}</span>
                </div>
                <button className="btn-small">↓ Download</button>
              </div>
            ))}
          </div>
        );

      case 'Subscription':
        return (
          <div>
            <div style={{ border: '4px solid var(--carbon-black)', padding: '2rem', marginBottom: '2rem', backgroundColor: 'var(--carbon-black)', color: 'var(--floral-white)' }}>
              <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>Current Plan</span>
              <h3 style={{ marginTop: '0.5rem', color: 'var(--floral-white)' }}>Enterprise — ₹999/month</h3>
              <p style={{ color: 'var(--dust-grey)', marginTop: '0.5rem' }}>
                Unlimited scans • Clause Rewriter • Version Diffing • AI Chat
              </p>
              <p style={{ color: 'var(--dust-grey)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                Next billing: August 15, 2026
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>Manage Subscription</button>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--charcoal-brown)' }}>Billing History</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Account Settings</span>
        <h1>User<br/>Profile.</h1>
      </header>

      {/* TABS */}
      <div className="tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        {renderTabContent()}
      </section>
    </section>
  );
}
