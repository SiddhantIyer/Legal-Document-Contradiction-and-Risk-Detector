import React, { useState } from 'react';
import { helpFaqs } from '../../data/mockData';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const TABS = ['FAQs', 'Documentation', 'Tutorials', 'Contact', 'Feedback'];

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState('FAQs');
  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'FAQs':
        return (
          <div>
            {helpFaqs.map((faq, i) => (
              <div key={i} className="accordion-item">
                <button className="accordion-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span>{openFaq === i ? '[-]' : '[+]'}</span>
                </button>
                <div className={`accordion-content ${openFaq === i ? 'open' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'Documentation':
        return (
          <div>
            {[
              { title: 'Getting Started Guide', desc: 'Learn how to upload your first contract and run analysis.', tag: 'BEGINNER' },
              { title: 'Understanding Risk Scores', desc: 'Deep dive into how risk scores are calculated and weighted.', tag: 'CORE' },
              { title: 'Clause Classification Taxonomy', desc: 'Reference for all clause types recognized by the system.', tag: 'REFERENCE' },
              { title: 'Contradiction Detection Algorithm', desc: 'Technical overview of the graph-based conflict detection.', tag: 'TECHNICAL' },
              { title: 'API Reference', desc: 'Complete REST API documentation for integration.', tag: 'DEVELOPER' },
              { title: 'Data Security & Compliance', desc: 'SOC 2, encryption standards, and data retention policies.', tag: 'SECURITY' },
            ].map((doc, i) => (
              <div key={i} className="file-card">
                <div className="file-card-info">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="category-badge">{doc.tag}</span>
                    <span className="file-card-name" style={{ fontSize: '0.95rem' }}>{doc.title}</span>
                  </div>
                  <span className="file-card-meta">{doc.desc}</span>
                </div>
                <button className="btn-small">Read →</button>
              </div>
            ))}
          </div>
        );

      case 'Tutorials':
        return (
          <div>
            {[
              { title: 'Upload & Analyze Your First Contract', duration: '5 min', level: 'Beginner' },
              { title: 'Using the AI Legal Chat', duration: '8 min', level: 'Beginner' },
              { title: 'Comparing Contract Versions', duration: '6 min', level: 'Intermediate' },
              { title: 'Clause Rewriting Best Practices', duration: '10 min', level: 'Intermediate' },
              { title: 'Understanding Contradiction Graphs', duration: '12 min', level: 'Advanced' },
              { title: 'Batch Processing Multiple Contracts', duration: '7 min', level: 'Advanced' },
            ].map((tut, i) => (
              <div key={i} className="file-card">
                <div className="file-card-info">
                  <span className="file-card-name">{tut.title}</span>
                  <span className="file-card-meta">{tut.duration} read • {tut.level}</span>
                </div>
                <button className="btn-small">Start →</button>
              </div>
            ))}
          </div>
        );

      case 'Contact':
        return (
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ border: '4px solid var(--carbon-black)', padding: '1.5rem' }}>
                <span className="label">Email Support</span>
                <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>support@machinecounsel.in</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)', marginTop: '0.25rem' }}>Response within 24 hours</p>
              </div>
              <div style={{ border: '4px solid var(--carbon-black)', padding: '1.5rem' }}>
                <span className="label">Enterprise Support</span>
                <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>enterprise@machinecounsel.in</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)', marginTop: '0.25rem' }}>Priority response within 4 hours</p>
              </div>
              <div style={{ border: '4px solid var(--carbon-black)', padding: '1.5rem' }}>
                <span className="label">Office</span>
                <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>Mumbai, Maharashtra, India</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)', marginTop: '0.25rem' }}>Mon–Fri, 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>
        );

      case 'Feedback':
        return (
          <div style={{ maxWidth: '600px' }}>
            {feedbackSent ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '4px solid var(--carbon-black)' }}>
                <h3 style={{ color: '#4a7c59' }}>✓ Feedback Submitted</h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--charcoal-brown)' }}>Thank you for your input. We review all feedback to improve Machine Counsel.</p>
                <button className="btn-small" style={{ marginTop: '1rem' }} onClick={() => { setFeedbackSent(false); setFeedbackText(''); }}>
                  Send More Feedback
                </button>
              </div>
            ) : (
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Your Feedback</label>
                  <textarea
                    className="form-input"
                    rows={6}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you think, report a bug, or suggest a feature..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select">
                    <option>General Feedback</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Performance Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', alignSelf: 'flex-start' }}
                  onClick={() => feedbackText.trim() && setFeedbackSent(true)}
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Support Center</span>
        <h1>Help<br/>Center.</h1>
      </header>

      {/* TABS */}
      <div className="tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        {renderContent()}
      </section>
    </section>
  );
}
