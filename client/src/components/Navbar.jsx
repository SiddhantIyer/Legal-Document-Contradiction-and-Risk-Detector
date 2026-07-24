import React from 'react';
import '../index.css';

export default function Navbar({ isAuthenticated = false, onNavigate, onLogout }) {
  return (
    <nav className="navbar">
      <button className="logo logo-button" type="button" onClick={() => onNavigate?.('/')}>
        MACHINE COUNSEL
      </button>
      
      {/* Public Links */}
      <div className="nav-links">
        <button type="button" className="nav-link" onClick={() => onNavigate?.('/')}>[ ALGORITHM ]</button>
        <button type="button" className="nav-link" onClick={() => onNavigate?.('/')}>[ PRECEDENTS ]</button>
        <button type="button" className="nav-link" onClick={() => onNavigate?.('/')}>[ DOCS ]</button>
      </div>

      {/* Conditional Auth Actions */}
      <div className="nav-auth">
        {isAuthenticated ? (
          <>
            <button className="btn-nav" type="button" onClick={() => onNavigate?.('/app')}>Dashboard</button>
            <button className="btn-nav logout" type="button" onClick={onLogout}>Logout</button>
          </>
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