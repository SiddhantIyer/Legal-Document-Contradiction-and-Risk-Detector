import React, { useState } from 'react';
import { knowledgeBase } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const CATEGORIES = ['All', 'IPC', 'Consumer Protection', 'IT Act', 'Contract Act', 'Arbitration'];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarks, setBookmarks] = useState(
    knowledgeBase.reduce((acc, item) => {
      acc[item.id] = item.bookmarked;
      return acc;
    }, {})
  );

  const toggleBookmark = (id) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = knowledgeBase.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Legal Database</span>
        <h1>Knowledge<br/>Base.</h1>
      </header>

      {/* SEARCH */}
      <section className="dashboard-section">
        <div className="search-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search legal provisions, acts, sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search knowledge base"
          />
          <button className="search-submit" type="button">
            Search
          </button>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="filter-tags" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-tag ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* RESULTS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: 0 }}>
            {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'}
          </h2>
          {search && (
            <button className="btn-small" onClick={() => setSearch('')}>Clear Search</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚖</span>
            <h3>No Results Found</h3>
            <p>Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="knowledge-card">
              <div
                className="knowledge-card-header"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span className="category-badge">{item.category}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem' }}>
                      {item.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)' }}>{item.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    className="bookmark-btn"
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id); }}
                    aria-label={bookmarks[item.id] ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    {bookmarks[item.id] ? '★' : '☆'}
                  </button>
                  <span style={{ fontWeight: 700 }}>{expandedId === item.id ? '[-]' : '[+]'}</span>
                </div>
              </div>
              <div className={`knowledge-card-body ${expandedId === item.id ? 'open' : ''}`}>
                <p>{item.content}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </section>
  );
}
