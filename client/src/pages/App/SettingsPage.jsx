import React, { useState } from 'react';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    emailNotifs: true,
    pushNotifs: false,
    analysisAlerts: true,
    weeklyReport: true,
    autoSave: true,
    compactMode: false,
    showLineNumbers: true,
    highlightRisks: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Configuration</span>
        <h1>System<br/>Settings.</h1>
      </header>

      {/* APPEARANCE */}
      <section className="dashboard-section">
        <h2>Appearance</h2>
        <div style={{ maxWidth: '600px' }}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Theme</label>
            <select className="form-select" value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value)}>
              <option value="light">Light (Default)</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Compact Mode</div>
              <div className="toggle-desc">Reduce spacing for denser information display.</div>
            </div>
            <div className={`toggle-switch ${settings.compactMode ? 'on' : ''}`} onClick={() => toggleSetting('compactMode')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGE */}
      <section className="dashboard-section">
        <h2>Language & Region</h2>
        <div style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-select" value={settings.language} onChange={(e) => updateSetting('language', e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="mr">Marathi</option>
            </select>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="dashboard-section">
        <h2>Notifications</h2>
        <div style={{ maxWidth: '600px' }}>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Email Notifications</div>
              <div className="toggle-desc">Receive updates via email.</div>
            </div>
            <div className={`toggle-switch ${settings.emailNotifs ? 'on' : ''}`} onClick={() => toggleSetting('emailNotifs')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Push Notifications</div>
              <div className="toggle-desc">Browser push notifications.</div>
            </div>
            <div className={`toggle-switch ${settings.pushNotifs ? 'on' : ''}`} onClick={() => toggleSetting('pushNotifs')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Analysis Alerts</div>
              <div className="toggle-desc">Get notified when analysis completes.</div>
            </div>
            <div className={`toggle-switch ${settings.analysisAlerts ? 'on' : ''}`} onClick={() => toggleSetting('analysisAlerts')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Weekly Report</div>
              <div className="toggle-desc">Receive a weekly analysis summary.</div>
            </div>
            <div className={`toggle-switch ${settings.weeklyReport ? 'on' : ''}`} onClick={() => toggleSetting('weeklyReport')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
        </div>
      </section>

      {/* ANALYSIS */}
      <section className="dashboard-section">
        <h2>Analysis Preferences</h2>
        <div style={{ maxWidth: '600px' }}>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Auto-Save Reports</div>
              <div className="toggle-desc">Automatically save analysis reports to your account.</div>
            </div>
            <div className={`toggle-switch ${settings.autoSave ? 'on' : ''}`} onClick={() => toggleSetting('autoSave')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Show Line Numbers</div>
              <div className="toggle-desc">Display clause line numbers in the viewer.</div>
            </div>
            <div className={`toggle-switch ${settings.showLineNumbers ? 'on' : ''}`} onClick={() => toggleSetting('showLineNumbers')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Highlight Risks</div>
              <div className="toggle-desc">Color-code clauses by risk severity.</div>
            </div>
            <div className={`toggle-switch ${settings.highlightRisks ? 'on' : ''}`} onClick={() => toggleSetting('highlightRisks')}>
              <div className="toggle-switch-knob" />
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="dashboard-section">
        <h2>Privacy & Data</h2>
        <div style={{ maxWidth: '600px' }}>
          <div style={{ padding: '1.5rem', border: '2px solid var(--carbon-black)', marginBottom: '1rem', backgroundColor: 'rgba(204,197,185,0.2)' }}>
            <span className="label">Data Retention</span>
            <p style={{ marginTop: '0.5rem' }}>Documents are encrypted at rest (AES-256) and automatically purged 30 days after analysis unless saved.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--carbon-black)' }}>
              Export My Data
            </button>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--spicy-paprika)' }}>
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* KEYBOARD SHORTCUTS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Keyboard Shortcuts</h2>
        <div className="action-table-wrapper">
          <table className="brutalist-table" style={{ minWidth: 'auto' }}>
            <thead>
              <tr>
                <th>Action</th>
                <th>Shortcut</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Upload Document', 'Ctrl + U'],
                ['New Analysis', 'Ctrl + N'],
                ['Open Chat', 'Ctrl + K'],
                ['Search', 'Ctrl + /'],
                ['Toggle Sidebar', 'Ctrl + B'],
                ['Export Report', 'Ctrl + E'],
                ['Previous Clause', '↑ Arrow'],
                ['Next Clause', '↓ Arrow'],
              ].map(([action, shortcut], i) => (
                <tr key={i}>
                  <td>{action}</td>
                  <td><code style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, backgroundColor: 'var(--dust-grey)', padding: '0.25rem 0.5rem', border: '1px solid var(--carbon-black)' }}>{shortcut}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
