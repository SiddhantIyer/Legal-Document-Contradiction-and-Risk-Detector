import React, { useState, useEffect } from 'react';
import { getBillingStatus, upgradeToPro } from '../../services/api';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const BillingPage = ({ user }) => {
  const [status, setStatus] = useState('FREE');
  const [loading, setLoading] = useState(true);
  const [upgradeMsg, setUpgradeMsg] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getBillingStatus();
      setStatus(data.subscriptionStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgradeMsg('Processing payment via Stripe...');
      // Simulate delay for stripe checkout
      setTimeout(async () => {
        const data = await upgradeToPro();
        setStatus(data.subscriptionStatus);
        setUpgradeMsg('Payment Successful! Welcome to PRO.');
      }, 1500);
    } catch (err) {
      setUpgradeMsg(`Upgrade failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Billing & Subscriptions</span>
        <h1>Current Plan: {status}</h1>
      </header>

      {user?.role === 'SUPER_ADMIN' && (
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e9ecef', border: '2px solid var(--carbon-black)' }}>
          <strong>Admin Override Active:</strong> As a SUPER_ADMIN, you bypass all billing and usage constraints.
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {/* FREE PLAN */}
        <div className="clause-card" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', opacity: status === 'FREE' ? 1 : 0.6 }}>
          <div className="clause-card-header" style={{ backgroundColor: 'var(--carbon-black)', color: 'var(--floral-white)' }}>
            <h2>Free Tier</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$0 / mo</div>
          </div>
          <div className="clause-card-body" style={{ flex: 1 }}>
            <ul style={{ listStyleType: 'square', paddingLeft: '20px', lineHeight: '2' }}>
              <li>Maximum 3 contracts</li>
              <li>Basic AI Analysis</li>
              <li>Single user (No Team Invites)</li>
            </ul>
          </div>
          {status === 'FREE' && <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', borderTop: '1px solid #ccc' }}>Current Plan</div>}
        </div>

        {/* PRO PLAN */}
        <div className="clause-card" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', border: status === 'PRO' ? '4px solid #4a7c59' : '' }}>
          <div className="clause-card-header" style={{ backgroundColor: '#4a7c59', color: 'white' }}>
            <h2>PRO Tier</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$99 / mo</div>
          </div>
          <div className="clause-card-body" style={{ flex: 1 }}>
            <ul style={{ listStyleType: 'square', paddingLeft: '20px', lineHeight: '2' }}>
              <li>Unlimited contracts</li>
              <li>Advanced AI Rewriting</li>
              <li>Team Workspace (Invite Members)</li>
              <li>Export to Microsoft Word</li>
            </ul>
          </div>
          {status === 'PRO' ? (
            <div style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', borderTop: '1px solid #ccc', color: '#4a7c59' }}>Current Plan</div>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #ccc' }}>
              <button className="btn-primary" style={{ width: '100%', backgroundColor: '#4a7c59' }} onClick={handleUpgrade}>
                Upgrade to PRO
              </button>
            </div>
          )}
        </div>
      </div>
      
      {upgradeMsg && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid var(--carbon-black)', fontWeight: 'bold' }}>
          {upgradeMsg}
        </div>
      )}
    </section>
  );
};

export default BillingPage;
