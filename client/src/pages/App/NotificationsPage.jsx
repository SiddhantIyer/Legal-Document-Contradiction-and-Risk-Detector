import React, { useState } from 'react';
import { notifications as initialNotifications } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="label">System Alerts</span>
            <h1>Notifications.</h1>
          </div>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '0.5rem' }}>
              <span className="unread-badge">{unreadCount} Unread</span>
              <button className="btn-small" onClick={markAllRead}>Mark All Read</button>
            </div>
          )}
        </div>
      </header>

      {/* FILTERS */}
      <section className="dashboard-section">
        <div className="filter-tags" style={{ marginBottom: 0 }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'success', label: 'Success' },
            { key: 'warning', label: 'Warnings' },
            { key: 'error', label: 'Errors' },
            { key: 'info', label: 'Info' },
          ].map(f => (
            <button key={f.key} className={`filter-tag ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* NOTIFICATION LIST */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">◉</span>
            <h3>No Notifications</h3>
            <p>You're all caught up. No notifications match this filter.</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notif.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`notification-icon ${notif.type}`}>
                {notif.type === 'success' ? '✓' : notif.type === 'warning' ? '!' : notif.type === 'error' ? '✕' : 'i'}
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  {notif.title}
                  {!notif.read && <span className="unread-badge" style={{ marginLeft: '0.5rem' }}>New</span>}
                </div>
                <div className="notification-message">{notif.message}</div>
                <div className="notification-time">{notif.time}</div>
              </div>
            </div>
          ))
        )}
      </section>
    </section>
  );
}
