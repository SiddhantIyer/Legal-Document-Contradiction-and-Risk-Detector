import React, { useState, useEffect } from 'react';
import { getTeam, inviteTeamMember } from '../../services/api';
import './AppPages.css';
import '../Dashboard/Dashboard.css'; // For shared styles like metric-card

const TeamManagementPage = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'PARALEGAL', password: 'password123' });
  const [inviteStatus, setInviteStatus] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await getTeam();
      setTeam(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setInviteStatus('Inviting...');
      await inviteTeamMember(inviteData);
      setInviteStatus('Invite sent successfully!');
      setInviteData({ ...inviteData, name: '', email: '' });
      fetchTeam(); // Refresh the list
      setTimeout(() => setInviteStatus(''), 3000);
    } catch (err) {
      setInviteStatus(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--charcoal-brown)' }}>Loading team data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Team Management</h1>
        </header>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Organization Settings</span>
        <h1>{team?.organization?.name || 'Your Team'}</h1>
      </header>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
        <div className="metric-card">
          <span className="label">Total Members</span>
          <div className="metric-value">{team?.members?.length || 0}</div>
        </div>
        <div className="metric-card">
          <span className="label">Subscription Tier</span>
          <div className="metric-value">{team?.organization?.subscriptionStatus || 'FREE'}</div>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Team Members</h2>
        <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--carbon-black)', color: 'var(--charcoal-brown)' }}>
                <th style={{ padding: '1rem 0' }}>Name</th>
                <th style={{ padding: '1rem 0' }}>Email</th>
                <th style={{ padding: '1rem 0' }}>Role</th>
                <th style={{ padding: '1rem 0' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {team?.members?.map((member) => (
                <tr key={member._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{member.name}</td>
                  <td style={{ padding: '1rem 0' }}>{member.email}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`severity-badge ${member.role === 'OWNER' ? 'high' : 'low'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--charcoal-brown)' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Invite New Member</h2>
        <p style={{ color: 'var(--charcoal-brown)', marginBottom: '1.5rem' }}>
          Add paralegals or partners to your organization so they can access the team's shared contracts.
        </p>

        <form onSubmit={handleInvite} style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input 
              type="text" 
              value={inviteData.name}
              onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
              required
              className="chat-input"
              style={{ borderRadius: '0', border: '2px solid var(--carbon-black)', padding: '0.75rem', width: '100%' }}
            />
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              value={inviteData.email}
              onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
              required
              className="chat-input"
              style={{ borderRadius: '0', border: '2px solid var(--carbon-black)', padding: '0.75rem', width: '100%' }}
            />
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
            <select 
              value={inviteData.role}
              onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
              className="chat-input"
              style={{ borderRadius: '0', border: '2px solid var(--carbon-black)', padding: '0.75rem', width: '100%', appearance: 'auto' }}
            >
              <option value="PARALEGAL">Paralegal</option>
              <option value="SENIOR_PARTNER">Senior Partner</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            Send Invite
          </button>
          {inviteStatus && <p style={{ fontWeight: 'bold', color: inviteStatus.includes('Error') ? 'var(--spicy-paprika)' : '#4a7c59' }}>{inviteStatus}</p>}
        </form>
      </section>
    </section>
  );
};

export default TeamManagementPage;
