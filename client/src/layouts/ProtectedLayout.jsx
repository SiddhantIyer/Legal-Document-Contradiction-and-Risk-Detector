import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ProtectedLayout.css';

export default function ProtectedLayout({ isAuthenticated, onNavigate, onLogout, user, contracts, onRefreshContracts }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="brutalist-wrapper">
      <div className="container protected-shell">
        <Navbar
          isAuthenticated={isAuthenticated}
          onNavigate={onNavigate}
          onLogout={onLogout}
          user={user}
          contracts={contracts}
        />

        <main className="protected-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
