import React from 'react';
import './Sidebar.css';

export default function Sidebar({ currentPath = '/app', onNavigate, onLogout }) {
  const navItems = [
    { id: 'HOME', label: '[ HOME ]', path: '/app' },
    { id: 'UPLOAD', label: '[ UPLOAD CONTRACT ]', path: '/app/upload' },
    { 
      id: 'WORKSPACE', 
      label: '[ CONTRACT WORKSPACE ]', 
      path: '/app/workspace/sample-contract',
      // Added nested structure for the Contract Workspace
      subItems: [
        { id: 'WS_OVERVIEW', label: 'Overview', path: '/app/workspace/sample-contract' },
        { id: 'WS_CLAUSES', label: 'Clause Viewer', path: '/app/clause-viewer' },
        { id: 'WS_CONTRA', label: 'Contradictions', path: '/app/contradictions' },
        { id: 'WS_REWRITE', label: 'Clause Rewrite', path: '/app/clause-rewrite' },
      ]
    },
    { id: 'PROCESSING', label: '[ PROCESSING ]', path: '/app/processing' },
    { id: 'ANALYSIS', label: '[ ANALYSIS RESULT ]', path: '/app/analysis' },
    { id: 'RISK', label: '[ RISK DASHBOARD ]', path: '/app/risk-dashboard' },
    { id: 'COMPARE', label: '[ COMPARE CONTRACTS ]', path: '/app/compare' },
    { id: 'CHAT', label: '[ AI LEGAL CHAT ]', path: '/app/chat' },
    { id: 'KNOWLEDGE', label: '[ KNOWLEDGE BASE ]', path: '/app/knowledge' },
    { id: 'HISTORY', label: '[ HISTORY ]', path: '/app/history' },
    { id: 'NOTIFICATIONS', label: '[ NOTIFICATIONS ]', path: '/app/notifications' },
    { id: 'PROFILE', label: '[ PROFILE ]', path: '/app/profile' },
    { id: 'SETTINGS', label: '[ SETTINGS ]', path: '/app/settings' },
    { id: 'HELP', label: '[ HELP CENTER ]', path: '/app/help' },
  ];

  const isActivePath = (itemPath, isExact = false) => {
    if (itemPath === '/app') {
      return currentPath === '/app';
    }
    // Strict exact match for sub-items to differentiate them
    if (isExact) {
      return currentPath === itemPath;
    }
    if (itemPath.startsWith('/app/workspace')) {
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
              onClick={() => onNavigate?.(item.path)}
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
                      className={`sidebar-sub-btn ${isActivePath(sub.path, true) ? 'active' : ''}`}
                      type="button"
                      onClick={() => onNavigate?.(sub.path)}
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