import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../index.css';

export default function Navbar({ isAuthenticated = false, onNavigate, onLogout, user, contracts = [] }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contractSwitcherOpen, setContractSwitcherOpen] = useState(false);
  const dropdownRef = useRef(null);
  const contractSwitcherRef = useRef(null);
  const location = useLocation();

  // Determine the active contract from the URL
  const activeContractId = location.pathname.startsWith('/app/workspace/')
    ? location.pathname.split('/app/workspace/')[1]
    : null;

  const activeContract = contracts.find(c => c._id === activeContractId);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (contractSwitcherRef.current && !contractSwitcherRef.current.contains(e.target)) {
        setContractSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const getSeverityClass = (severity) => {
    if (!severity) return '';
    return severity.toLowerCase();
  };

  const truncateName = (name, maxLen = 28) => {
    if (!name) return '';
    return name.length > maxLen ? name.substring(0, maxLen) + '…' : name;
  };

  return (
    <nav className="navbar">
      <button className="logo logo-button" type="button" onClick={() => onNavigate?.('/')}>
        MACHINE COUNSEL
      </button>

      {/* Authenticated nav links */}
      {isAuthenticated && (
        <div className="nav-links">
          <button type="button" className="nav-link" onClick={() => onNavigate?.('/app')}>[ DASHBOARD ]</button>

          {/* Contract Switcher */}
          <div className="contract-switcher-wrapper" ref={contractSwitcherRef}>
            <button
              type="button"
              className={`nav-link contract-switcher-trigger ${activeContractId ? 'active-contract' : ''}`}
              onClick={() => setContractSwitcherOpen(prev => !prev)}
            >
              {activeContract
                ? `[ ◈ ${truncateName(activeContract.name, 22)} ]`
                : '[ CONTRACT WORKSPACE ▾ ]'
              }
            </button>

            {contractSwitcherOpen && (
              <div className="contract-switcher-dropdown">
                <div className="contract-switcher-header">
                  <span className="contract-switcher-title">Your Contracts</span>
                  <span className="contract-switcher-count">{contracts.length}</span>
                </div>

                <div className="contract-switcher-divider" />

                {contracts.length === 0 ? (
                  <div className="contract-switcher-empty">
                    <span>No contracts yet</span>
                    <p>Upload your first contract to get started.</p>
                  </div>
                ) : (
                  <div className="contract-switcher-list">
                    {contracts.map(c => (
                      <button
                        key={c._id}
                        className={`contract-switcher-item ${c._id === activeContractId ? 'active' : ''}`}
                        type="button"
                        onClick={() => {
                          onNavigate?.(`/app/workspace/${c._id}`);
                          setContractSwitcherOpen(false);
                        }}
                      >
                        <div className="contract-switcher-item-info">
                          <span className="contract-switcher-item-name">{truncateName(c.name)}</span>
                          <span className="contract-switcher-item-meta">
                            {c.type} • {c.uploadDate}
                          </span>
                        </div>
                        <div className="contract-switcher-item-badges">
                          {c.riskScore !== null && (
                            <span className={`contract-switcher-risk ${getSeverityClass(c.severity)}`}>
                              {c.riskScore}
                            </span>
                          )}
                          {c.status === 'Processing' && (
                            <span className="contract-switcher-processing">⟳</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="contract-switcher-divider" />

                <button
                  className="contract-switcher-new"
                  type="button"
                  onClick={() => {
                    onNavigate?.('/app/upload');
                    setContractSwitcherOpen(false);
                  }}
                >
                  <span>↑</span> New Analysis
                </button>
              </div>
            )}
          </div>

          <button type="button" className="nav-link" onClick={() => onNavigate?.('/app/knowledge')}>[ KNOWLEDGE BASE ]</button>
          <button type="button" className="nav-link" onClick={() => onNavigate?.('/app/library')}>[ CLAUSE LIBRARY ]</button>
        </div>
      )}

      {/* Conditional Auth Actions */}
      <div className="nav-auth">
        {isAuthenticated ? (
          <div className="profile-dropdown-wrapper" ref={dropdownRef}>
            <button
              className="profile-avatar-btn"
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              title="Account menu"
            >
              {userInitial}
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <span className="profile-dropdown-name">{user?.name || 'User'}</span>
                  <span className="profile-dropdown-email">{user?.email || ''}</span>
                </div>
                <div className="profile-dropdown-divider" />
                <button
                  className="profile-dropdown-item"
                  type="button"
                  onClick={() => { onNavigate?.('/app/history'); setDropdownOpen(false); }}
                >
                  History
                </button>
                <button
                  className="profile-dropdown-item"
                  type="button"
                  onClick={() => { onNavigate?.('/app/profile'); setDropdownOpen(false); }}
                >
                  Profile
                </button>
                <div className="profile-dropdown-divider" />
                <button
                  className="profile-dropdown-item logout-item"
                  type="button"
                  onClick={() => { onLogout?.(); setDropdownOpen(false); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="btn-nav login" type="button" onClick={() => onNavigate?.('/login')}>Login</button>
            <button className="btn-nav register" type="button" onClick={() => onNavigate?.('/register')}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}