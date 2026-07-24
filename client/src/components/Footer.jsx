import React from 'react';
import '../index.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-header">
        <h2>End of Line.</h2>
      </div>
      
      <div className="footer-grid">
        <div className="footer-col">
          <h4>System</h4>
          <ul>
            <li>Version: 9.4.1</li>
            <li>Status: <span style={{ color: 'var(--spicy-paprika)' }}>Operational</span></li>
            <li>Uptime: 99.99%</li>
            <li>Latency: 12ms</li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">[ DOCUMENTATION ]</a></li>
            <li><a href="#">[ API REFERENCE ]</a></li>
            <li><a href="#">[ PRECEDENT CORPUS ]</a></li>
            <li><a href="#">[ CHANGELOG ]</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">TERMS OF SERVICE</a></li>
            <li><a href="#">PRIVACY PROTOCOL</a></li>
            <li><a href="#">DATA PROCESSING</a></li>
            <li><a href="#">SECURITY</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Terminal Command</h4>
          <p style={{ marginTop: '1rem', color: 'var(--dust-grey)' }}>
            &gt; root@machine-counsel:~# shutdown -h now
          </p>
        </div>
      </div>
      
      <div className="footer-warning">
        WARNING: MACHINE COUNSEL IS AN ALGORITHMIC TOOL. IT DOES NOT CONSTITUTE A BINDING ATTORNEY-CLIENT RELATIONSHIP. DO NOT USE FOR CAPITAL OFFENSES OR TREASON. PROCEED AT YOUR OWN EXISTENTIAL RISK.
      </div>
    </footer>
  );
}