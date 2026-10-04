import React from 'react';
import './Sidebar.css';

export default function Sidebar({ currentPath = '/app', onNavigate, onLogout }) {
  const navItems = [
    { id: 'DASHBOARD', label: '[ DASHBOARD ]', path: '/app' },
    { id: 'UPLOAD', label: '[ NEW ANALYSIS ]', path: '/app/upload' },
    { 
      id: 'WORKSPACE', 
      label: '[ CONTRACT WORKSPACE ]', 
      path: '/app/workspace',
      subItems: [
        { id: 'WS_OVERVIEW', label: 'Overview' },
        { id: 'WS_DOCUMENT', label: 'Document' },
        { id: 'WS_FINDINGS', label: 'Findings' },
        { id: 'WS_CHAT', label: 'AI Chat' },
        { id: 'WS_SUGGESTIONS', label: 'Clause Suggestions' },
        { id: 'WS_COMPARE', label: 'Compare Contracts' },
      ]
    },
    { id: 'KNOWLEDGE', label: '[ KNOWLEDGE BASE ]', path: '/app/knowledge' },
    { id: 'HISTORY', label: '[ HISTORY ]', path: '/app/history' },
    { id: 'LIBRARY', label: '[ CLAUSE LIBRARY ]', path: '/app/library' },
    { id: 'PROFILE', label: '[ PROFILE ]', path: '/app/profile' },
    { id: 'TEAM', label: '[ TEAM MANAGEMENT ]', path: '/app/team' },
    { id: 'SECURITY', label: '[ SECURITY & COMPLIANCE ]', path: '/app/security' },
    { id: 'BILLING', label: '[ BILLING & PLANS ]', path: '/app/billing' },
  ];

  const isActivePath = (itemPath) => {
    if (itemPath === '/app') {
      return currentPath === '/app';
    }
    if (itemPath === '/app/workspace') {
      return currentPath.startsWith('/app/workspace');
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <aside className="global-sidebar">
      <div className="sidebar-menu">
        <span className="label">System Navigation</span>
        
        {navItems.map((item) => (
          <React.Fragment key={item.id}>
            <button 
              className={`sidebar-btn ${isActivePath(item.path) ? 'active' : ''}`}
              type="button"
              onClick={() => {
                if (item.path === '/app/workspace') {
                  onNavigate?.('/app/workspace/CTR_001');
                } else {
                  onNavigate?.(item.path);
                }
              }}
            >
              {item.label}
            </button>
            
            {/* Render nested workspace structure if parent is active */}
            {item.subItems && isActivePath(item.path) && (
              <div className="sidebar-submenu">
                {item.subItems.map((sub, index) => {
                  const isLast = index === item.subItems.length - 1;
                  return (
                    <button
                      key={sub.id}
                      className="sidebar-sub-btn"
                      type="button"
                      onClick={() => onNavigate?.(currentPath)}
                    >
                      {/* ASCII tree branches for brutalist layout */}
                      <span className="tree-branch">{isLast ? '└──' : '├──'}</span> {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        ))}

        <button className="sidebar-btn" type="button" onClick={onLogout}>
          [ LOGOUT ]
        </button>
      </div>
      
      <div className="sidebar-footer">
        <span className="label">Session Data</span>
        <p className="doc-meta">User: ID_9402</p>
        <p className="doc-meta">Role: Enterprise</p>
        <p className="doc-meta">Compute: 420ms</p>
      </div>
    </aside>
  );
}