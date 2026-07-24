import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import './ProtectedLayout.css';

export default function ProtectedLayout({ isAuthenticated, onNavigate, onLogout }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="brutalist-wrapper">
      <div className="container protected-shell">
        <Navbar isAuthenticated={isAuthenticated} onNavigate={onNavigate} onLogout={onLogout} />

        <div className="protected-layout">
          <Sidebar currentPath={location.pathname} onNavigate={onNavigate} onLogout={onLogout} />

          <main className="protected-main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
