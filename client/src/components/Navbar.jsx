import React, { useState, useEffect, useRef } from 'react';
import '../index.css';

export default function Navbar({ isAuthenticated = false, onNavigate, onLogout, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <button className="logo logo-button" type="button" onClick={() => onNavigate?.('/')}>
        MACHINE COUNSEL
      </button>

      {/* Authenticated nav links */}
      {isAuthenticated && (
        <div className="nav-links">
          <button type="button" className="nav-link" onClick={() => onNavigate?.('/app')}>[ DASHBOARD ]</button>
          <button type="button" className="nav-link" onClick={() => onNavigate?.('/app/workspace/CTR_001')}>[ CONTRACT WORKSPACE ]</button>
          <button type="button" className="nav-link" onClick={() => onNavigate?.('/app/knowledge')}>[ KNOWLEDGE BASE ]</button>
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