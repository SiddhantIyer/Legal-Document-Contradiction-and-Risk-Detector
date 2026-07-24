import React, { useState, useEffect } from 'react';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const STEPS = [
  { id: 1, label: 'Uploading Document', description: 'Transferring file to ingestion pipeline...', duration: '1.2s' },
  { id: 2, label: 'OCR Processing', description: 'Extracting text with positional metadata...', duration: '3.4s' },
  { id: 3, label: 'Extracting Clauses', description: 'Parsing document into clause-level segments...', duration: '2.1s' },
  { id: 4, label: 'Classifying Clauses', description: 'Mapping to internal legal taxonomy...', duration: '1.8s' },
  { id: 5, label: 'Contradiction Detection', description: 'Graph traversal for logical conflicts...', duration: '2.5s' },
  { id: 6, label: 'Risk Analysis', description: 'Scoring clauses against Indian jurisprudence...', duration: '3.1s' },
  { id: 7, label: 'Generating Report', description: 'Compiling structured risk summary...', duration: '1.4s' },
];

export default function DocumentProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      setCompleted(true);
      setOverallProgress(100);
      return;
    }

    setOverallProgress(Math.round((currentStep / STEPS.length) * 100));

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const getStepStatus = (index) => {
    if (index < currentStep) return 'complete';
    if (index === currentStep && !completed) return 'active';
    return 'pending';
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCompleted(false);
    setOverallProgress(0);
  };

  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Processing Pipeline</span>
        <h1>Analyzing<br/>Contract.</h1>
      </header>

      {/* OVERALL PROGRESS */}
      <section className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="label" style={{ marginBottom: 0 }}>
            {completed ? 'Analysis Complete' : `Step ${Math.min(currentStep + 1, STEPS.length)} of ${STEPS.length}`}
          </span>
          <span style={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', fontSize: '1.5rem' }}>
            {overallProgress}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${overallProgress}%`, transition: 'width 0.5s ease' }}
          />
        </div>

        {completed && (
          <div style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem', border: '4px solid var(--carbon-black)', backgroundColor: 'var(--carbon-black)', color: 'var(--floral-white)' }}>
            <h3 style={{ color: 'var(--spicy-paprika)', marginBottom: '0.5rem' }}>✓ ANALYSIS COMPLETE</h3>
            <p style={{ marginBottom: '1.5rem' }}>42 clauses parsed • 3 contradictions detected • Risk Score: 84/100</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-small" style={{ backgroundColor: 'var(--spicy-paprika)', color: 'var(--floral-white)' }}>View Report</button>
              <button className="btn-small" style={{ backgroundColor: 'var(--floral-white)', color: 'var(--carbon-black)' }}>View Clauses</button>
              <button className="btn-small" style={{ backgroundColor: 'var(--floral-white)', color: 'var(--carbon-black)' }} onClick={handleRestart}>Restart Demo</button>
            </div>
          </div>
        )}
      </section>

      {/* PROCESSING STEPS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Execution Log</h2>
        <div className="processing-container">
          {STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className={`processing-step ${status}`}>
                <div className="step-indicator">
                  {status === 'complete' ? '✓' : status === 'active' ? '◉' : step.id}
                </div>
                <div className="step-content">
                  <h4>{step.label}</h4>
                  <p>{step.description}</p>
                  {status === 'complete' && (
                    <span className="stat-pill positive" style={{ marginTop: '0.5rem' }}>
                      Completed in {step.duration}
                    </span>
                  )}
                  {status === 'active' && (
                    <span className="stat-pill negative" style={{ marginTop: '0.5rem' }}>
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
