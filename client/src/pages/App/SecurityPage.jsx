import React, { useState, useEffect } from 'react';
import { getAuditLogs, enable2FA, verify2FA, disable2FA } from '../../services/api';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const SecurityPage = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 2FA state
  const [qrCode, setQrCode] = useState(null);
  const [totpToken, setTotpToken] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [disablePassword, setDisablePassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchAuditLogs();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data.logs);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const data = await enable2FA();
      setQrCode(data.qrCode);
      setMessage('Scan the QR code with your authenticator app, then enter the token to verify.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    try {
      await verify2FA(totpToken);
      setIs2FAEnabled(true);
      setQrCode(null);
      setTotpToken('');
      setMessage('2FA Enabled Successfully!');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    try {
      await disable2FA(disablePassword);
      setIs2FAEnabled(false);
      setDisablePassword('');
      setMessage('2FA Disabled Successfully!');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Account & Compliance</span>
        <h1>Security Settings.</h1>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* 2FA Section */}
        <section className="dashboard-section" style={{ flex: '1', minWidth: '300px' }}>
          <h2>Two-Factor Authentication (2FA)</h2>
          <p style={{ color: 'var(--charcoal-brown)', marginBottom: '1.5rem' }}>
            Add an extra layer of security to your account by requiring a TOTP code during login.
          </p>

          {!is2FAEnabled ? (
            <div>
              {!qrCode ? (
                <button className="btn-primary" onClick={handleEnable2FA}>Setup 2FA</button>
              ) : (
                <form onSubmit={handleVerify2FA} style={{ display: 'grid', gap: '1rem' }}>
                  <img src={qrCode} alt="2FA QR Code" style={{ border: '2px solid var(--carbon-black)', width: '200px' }} />
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit token" 
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value)}
                    required
                    className="chat-input"
                    style={{ borderRadius: '0', border: '2px solid var(--carbon-black)' }}
                  />
                  <button type="submit" className="btn-primary">Verify & Enable</button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleDisable2FA} style={{ display: 'grid', gap: '1rem', maxWidth: '300px' }}>
              <span className="severity-badge high" style={{ alignSelf: 'start' }}>2FA is Enabled</span>
              <input 
                type="password" 
                placeholder="Enter password to disable" 
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                className="chat-input"
                style={{ borderRadius: '0', border: '2px solid var(--carbon-black)' }}
              />
              <button type="submit" className="btn-secondary" style={{ border: '2px solid var(--spicy-paprika)', color: 'var(--spicy-paprika)' }}>Disable 2FA</button>
            </form>
          )}
          {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
        </section>

        {/* Audit Logs Section */}
        <section className="dashboard-section" style={{ flex: '2', minWidth: '400px' }}>
          <h2>Organization Audit Logs</h2>
          {user?.role !== 'OWNER' ? (
            <p style={{ color: 'var(--charcoal-brown)' }}>Only the Organization OWNER can view audit logs.</p>
          ) : loading ? (
            <div className="loading-spinner"></div>
          ) : error ? (
            <p style={{ color: 'var(--spicy-paprika)' }}>{error}</p>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', border: '2px solid var(--carbon-black)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--floral-white)' }}>
                  <tr style={{ borderBottom: '2px solid var(--carbon-black)' }}>
                    <th style={{ padding: '0.5rem' }}>Timestamp</th>
                    <th style={{ padding: '0.5rem' }}>User</th>
                    <th style={{ padding: '0.5rem' }}>Action</th>
                    <th style={{ padding: '0.5rem' }}>Resource</th>
                    <th style={{ padding: '0.5rem' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '0.5rem', color: 'var(--charcoal-brown)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{log.userName}</td>
                      <td style={{ padding: '0.5rem' }}><span className="stat-pill" style={{ backgroundColor: '#e9ecef' }}>{log.action}</span></td>
                      <td style={{ padding: '0.5rem' }}>{log.resource}</td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No audit logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default SecurityPage;
