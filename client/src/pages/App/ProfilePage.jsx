import React, { useState } from 'react';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const TABS = ['Profile', 'Preferences', 'Account Settings'];

export default function ProfilePage({ user }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const defaultProfile = {
    name: user?.name || '',
    email: user?.email || '',
    company: '',
    phone: '',
    role: 'Free',
    joinDate: '\u2014',
    documentsUsed: 0,
  };
  const [profile, setProfile] = useState(defaultProfile);

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
              <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <p className="doc-meta" style={{ color: 'var(--charcoal-brown)' }}>Company: {profile.company}</p>
                <p className="doc-meta" style={{ color: 'var(--charcoal-brown)' }}>Joined: {profile.joinDate}</p>
                <p className="doc-meta" style={{ color: 'var(--charcoal-brown)' }}>Documents: {profile.documentsUsed}</p>
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

      case 'Preferences':
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

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '4px solid var(--carbon-black)' }}>
              <h3>Display Preferences</h3>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Default Risk Threshold</label>
                <select className="form-select" defaultValue="70">
                  <option value="50">50 — Conservative</option>
                  <option value="70">70 — Standard</option>
                  <option value="85">85 — Relaxed</option>
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Default Analysis Mode</label>
                <select className="form-select" defaultValue="balanced">
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="market">Market Standard</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'Account Settings':
        return (
          <div>
            {/* PASSWORD */}
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
            </div>

            {/* 2FA */}
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

            {/* SESSIONS */}
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

            {/* SUBSCRIPTION */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '4px solid var(--carbon-black)' }}>
              <h3>Subscription</h3>
              <div style={{ border: '4px solid var(--carbon-black)', padding: '2rem', marginTop: '1rem', backgroundColor: 'var(--carbon-black)', color: 'var(--floral-white)' }}>
                <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>Current Plan</span>
                <h3 style={{ marginTop: '0.5rem', color: 'var(--floral-white)' }}>Enterprise — ₹999/month</h3>
                <p style={{ color: 'var(--dust-grey)', marginTop: '0.5rem' }}>
                  Unlimited scans • Clause Rewriter • Version Diffing • AI Chat
                </p>
                <p style={{ color: 'var(--dust-grey)', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  Next billing: August 15, 2026
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>Manage Subscription</button>
                <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--charcoal-brown)' }}>Billing History</button>
              </div>
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
