import React, { useState, useEffect } from 'react';
import { getClauseTemplates, saveClauseTemplates, getBaselineCorpus, saveBaselineCorpus } from '../../services/api';
import './AppPages.css';

export default function ClauseLibraryPage() {
  const [activeTab, setActiveTab] = useState('templates');
  
  // State for templates
  const [templates, setTemplates] = useState({});
  const [rawTemplates, setRawTemplates] = useState('');
  
  // State for baseline corpus
  const [baseline, setBaseline] = useState([]);
  const [rawBaseline, setRawBaseline] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tempData, baseData] = await Promise.all([
        getClauseTemplates(),
        getBaselineCorpus()
      ]);
      setTemplates(tempData);
      setRawTemplates(JSON.stringify(tempData, null, 2));
      
      setBaseline(baseData);
      setRawBaseline(JSON.stringify(baseData, null, 2));
    } catch (err) {
      setError(err.message || 'Failed to fetch library data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplates = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    try {
      const parsed = JSON.parse(rawTemplates);
      await saveClauseTemplates(parsed);
      setTemplates(parsed);
      setSuccessMessage('Clause templates saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format in templates. Please fix syntax errors.');
      } else {
        setError(err.message || 'Failed to save templates');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBaseline = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    try {
      const parsed = JSON.parse(rawBaseline);
      await saveBaselineCorpus(parsed);
      setBaseline(parsed);
      setSuccessMessage('Baseline corpus saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format in baseline. Please fix syntax errors.');
      } else {
        setError(err.message || 'Failed to save baseline');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-main">
        <header className="dashboard-header">
          <span className="label">Loading Library...</span>
          <h1>Clause<br/>Library.</h1>
        </header>
      </section>
    );
  }

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Knowledge Management</span>
        <h1>Clause<br/>Library.</h1>
      </header>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', border: '2px solid var(--spicy-paprika)', backgroundColor: 'rgba(235,94,40,0.05)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '1rem', marginBottom: '1rem', border: '2px solid #4a7c59', backgroundColor: 'rgba(74,124,89,0.05)', color: '#4a7c59' }}>
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Clause Templates
        </button>
        <button 
          className={`tab ${activeTab === 'baseline' ? 'active' : ''}`}
          onClick={() => setActiveTab('baseline')}
        >
          Baseline Corpus (Anomaly Detection)
        </button>
      </div>

      <div className="tab-content" style={{ marginTop: '2rem' }}>
        {activeTab === 'templates' && (
          <div className="library-section">
            <h3 style={{ marginBottom: '1rem' }}>Edit Clause Templates (JSON)</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--charcoal-brown)' }}>
              These templates are used by the AI to suggest redlines and rewrites. 
              The format must be a valid JSON object mapping clause types to tone templates.
            </p>
            <textarea
              value={rawTemplates}
              onChange={(e) => setRawTemplates(e.target.value)}
              style={{
                width: '100%',
                height: '500px',
                fontFamily: 'monospace',
                padding: '1rem',
                backgroundColor: 'var(--carbon-black)',
                color: 'var(--floral-white)',
                border: '1px solid var(--charcoal-brown)',
                borderRadius: '4px'
              }}
            />
            <button 
              className="btn" 
              onClick={handleSaveTemplates} 
              disabled={saving}
              style={{ marginTop: '1rem' }}
            >
              {saving ? 'Saving...' : 'Save Templates'}
            </button>
          </div>
        )}

        {activeTab === 'baseline' && (
          <div className="library-section">
            <h3 style={{ marginBottom: '1rem' }}>Edit Baseline Corpus (JSON)</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--charcoal-brown)' }}>
              This corpus trains the Isolation Forest for anomaly detection. 
              It should be a valid JSON array of clause strings representing "normal" or "market-standard" clauses.
            </p>
            <textarea
              value={rawBaseline}
              onChange={(e) => setRawBaseline(e.target.value)}
              style={{
                width: '100%',
                height: '500px',
                fontFamily: 'monospace',
                padding: '1rem',
                backgroundColor: 'var(--carbon-black)',
                color: 'var(--floral-white)',
                border: '1px solid var(--charcoal-brown)',
                borderRadius: '4px'
              }}
            />
            <button 
              className="btn" 
              onClick={handleSaveBaseline} 
              disabled={saving}
              style={{ marginTop: '1rem' }}
            >
              {saving ? 'Saving...' : 'Save Baseline'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
