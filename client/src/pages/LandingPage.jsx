import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { testimonials, platformStats } from '../data/mockData';
import '../index.css';
import './App/AppPages.css';

export default function Landing({ navbarProps = {} }) {
  const [openFaq, setOpenFaq] = useState(null);

  // Scroll Reveal Hook
  useEffect(() => {
    // 1. Prevent browser from auto-scrolling on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // 2. Force scroll to top on mount
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const faqs = [
    { q: "Is this legal advice?", a: "No. The system flags contradictions and anomalies against industry standards. It does not constitute a binding attorney-client relationship." },
    { q: "What laws is this grounded in?", a: "Our knowledge base retrieves precedents specifically from Indian law, including the IPC, Consumer Protection Act 2019, and IT Act." },
    { q: "Can it fix bad clauses?", a: "Yes. Using the Clause Redliner, the system suggests safer, balanced rewrites for one-sided terms rather than just warning you." },
    { q: "What formats do you support?", a: "PDF, DOCX, and scanned images (JPG/PNG). Our ingestion pipeline includes OCR for scanned contracts." },
    { q: "How long does analysis take?", a: "Typical contract analysis completes in 8-15 seconds depending on document length and complexity. OCR processing for scanned documents may take slightly longer." },
    { q: "Is my data secure?", a: "All documents are encrypted at rest (AES-256) and in transit (TLS 1.3). Documents are purged after analysis unless explicitly saved. SOC 2 Type II certified." },
  ];

  return (
    <div className="brutalist-wrapper">
      <div className="container">
        
        <Navbar {...navbarProps} />

        {/* HERO - Now perfectly fits viewport */}
        <section className="hero scroll-reveal">
          <div>
            <span className="label">System V.9.4.1 Online</span>
            <h1>Justice.<br/>Computed.</h1>
            <p>
              Traditional lawyers charge ₹5,000 to ₹50,000 for a single review. 
              Bypass the billable hour. Upload your contract, detect contradictions, and receive structured risk reports grounded in Indian jurisprudence.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => navbarProps.onNavigate?.('/login')}>Initialize Query</button>
              <button className="btn-primary" style={{ backgroundColor: 'var(--carbon-black)', color: 'var(--floral-white)' }} onClick={() => navbarProps.onNavigate?.('/register')}>
                View Precedents
              </button>
            </div>
          </div>
        </section>

        {/* PLATFORM STATISTICS */}
        <section className="scroll-reveal" style={{ padding: 0 }}>
          <div className="stats-row">
            {platformStats.map((stat, idx) => (
              <div key={idx} className="stats-row-item">
                <div className="stats-row-value">{stat.value}</div>
                <div className="stats-row-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="scroll-reveal">
          <h2>Execution Protocol</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <span className="label" style={{ borderBottomColor: 'var(--charcoal-brown)' }}>Ingest</span>
              <h3>Upload</h3>
              <p>Drop your PDF, DOCX, or scanned contract. Our OCR engine and Document Parser extract raw text with positional metadata.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <span className="label" style={{ borderBottomColor: 'var(--charcoal-brown)' }}>Process</span>
              <h3>Analyze</h3>
              <p>The AI models clauses into a directed dependency graph, detecting logical conflicts and cycles.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <span className="label" style={{ borderBottomColor: 'var(--charcoal-brown)' }}>Output</span>
              <h3>Report</h3>
              <p>Receive a section-by-section risk summary with plain-English explanations and citations to real laws.</p>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES (Redesigned based on image_2ed2a1.png) */}
        <section className="features-section scroll-reveal">
          <h2>Core Capabilities</h2>
          <div className="features-grid">
            <div className="feature-box">
              <span className="label">FEATURE_01</span>
              <h3>RISK<br/>DETECTION</h3>
              <p>Identifies one-sided terms, missing standard protections, and jurisdiction-specific red flags under Indian law.</p>
            </div>
            <div className="feature-box">
              <span className="label">FEATURE_02</span>
              <h3>CONTRADICTION<br/>MATRIX</h3>
              <p>Graph-based traversal detects if a right granted in Clause 4 is quietly negated by a restriction in Clause 12.</p>
            </div>
            <div className="feature-box">
              <span className="label">FEATURE_03</span>
              <h3>AI LEGAL<br/>CHAT</h3>
              <p>Multi-turn conversational RAG. Ask natural language follow-up questions grounded strictly in your uploaded document.</p>
            </div>
            <div className="feature-box">
              <span className="label">FEATURE_04</span>
              <h3>CLAUSE<br/>REWRITE</h3>
              <p>Don't just find risks—fix them. The system generates market-standard, safer rewrites for dangerous clauses.</p>
            </div>
            <div className="feature-box" style={{ gridColumn: 'span 2' }}>
              <span className="label">FEATURE_05</span>
              <h3>VERSION<br/>DIFFING</h3>
              <p>Upload your draft vs. the counterparty's redline. Semantic sequence alignment highlights how the actual risk profile shifted between revisions.</p>
            </div>
          </div>
        </section>

        {/* SUPPORTED CONTRACT TYPES */}
        <section className="scroll-reveal">
          <h2>Recognized Schemas</h2>
          <p style={{ marginBottom: '2rem' }}>Baseline corpus trained on 500+ standard templates.</p>
          <div className="contract-tags">
            <div className="contract-tag">Non-Disclosure (NDA)</div>
            <div className="contract-tag">SaaS Agreements</div>
            <div className="contract-tag">Employment Contracts</div>
            <div className="contract-tag">Freelancer Services</div>
            <div className="contract-tag">Vendor / Supply</div>
            <div className="contract-tag">Lease / Rental</div>
            <div className="contract-tag">Co-Founder Terms</div>
            <div className="contract-tag">Investment Term Sheets</div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="scroll-reveal" style={{ backgroundColor: 'var(--dust-grey)' }}>
          <h2>Field Reports</h2>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section style={{ backgroundColor: 'var(--spicy-paprika)', color: 'var(--floral-white)', borderBottomColor: 'var(--carbon-black)' }} className="scroll-reveal">
          <h2 style={{ color: 'var(--carbon-black)' }}>The Advantage</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <h3 style={{ borderBottom: '2px solid var(--carbon-black)', paddingBottom: '0.5rem' }}>Localized Engine</h3>
              <p style={{ color: 'var(--floral-white)' }}>Not a generic LLM. Grounded strictly in the IPC, Consumer Protection Act, and IT Act.</p>
            </div>
            <div>
              <h3 style={{ borderBottom: '2px solid var(--carbon-black)', paddingBottom: '0.5rem' }}>Zero Retainer</h3>
              <p style={{ color: 'var(--floral-white)' }}>No mahogany desks. Pay strictly for computational cycles consumed.</p>
            </div>
            <div>
              <h3 style={{ borderBottom: '2px solid var(--carbon-black)', paddingBottom: '0.5rem' }}>Sub-15s Analysis</h3>
              <p style={{ color: 'var(--floral-white)' }}>Full contract analysis in under 15 seconds. From upload to actionable risk report.</p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="scroll-reveal">
          <h2>Compute Costs</h2>
          <div className="pricing-grid">
            <div className="price-card">
              <span className="label">Standard</span>
              <h1 style={{ border: 'none', marginBottom: '0' }}>Free</h1>
              <p style={{ marginBottom: '2rem' }}>For Individuals & Freelancers</p>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li>+ 3 Contract Scans / Month</li>
                <li>+ Basic Risk Detection</li>
                <li>+ Standard Output Output</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', fontSize: '1rem' }} onClick={() => navbarProps.onNavigate?.('/register')}>Initialize</button>
            </div>
            <div className="price-card pro">
              <span className="label">Enterprise</span>
              <h1 style={{ border: 'none', marginBottom: '0' }}>₹999<span style={{ fontSize: '1rem' }}>/mo</span></h1>
              <p style={{ marginBottom: '2rem', color: 'var(--dust-grey)' }}>For SMEs & Startups</p>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li>+ Unlimited Scans</li>
                <li>+ Clause Rewriter Engine</li>
                <li>+ Version Diffing Analysis</li>
                <li>+ Multi-turn RAG Chatbot</li>
              </ul>
              <button className="btn-primary" style={{ width: '100%', fontSize: '1rem', backgroundColor: 'var(--floral-white)', color: 'var(--carbon-black)' }} onClick={() => navbarProps.onNavigate?.('/register')}>Upgrade System</button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="scroll-reveal">
          <h2>Query parameters</h2>
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div 
                  className="faq-question" 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.q}
                  <span>{openFaq === index ? '[-]' : '[+]'}</span>
                </div>
                <div className={`faq-answer ${openFaq === index ? 'open' : ''}`}>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="scroll-reveal" style={{ backgroundColor: 'var(--carbon-black)', color: 'var(--floral-white)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to Deploy?</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: 'var(--dust-grey)' }}>
            Upload your first contract and receive a comprehensive risk analysis in under 15 seconds. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navbarProps.onNavigate?.('/register')}>Start Free Analysis</button>
            <button className="btn-primary" style={{ backgroundColor: 'var(--floral-white)', color: 'var(--carbon-black)' }} onClick={() => navbarProps.onNavigate?.('/login')}>
              Login to Dashboard
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />

      </div>
    </div>
  );
}