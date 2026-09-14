import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getContractById, chatWithContract } from '../../services/api';
import { versionDiffData, chatMessages as initialChatMessages, suggestedQuestions, riskTimeline } from '../../data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import './AppPages.css';
import '../Dashboard/Dashboard.css';

const TABS = ['Overview', 'Document', 'Findings', 'AI Chat', 'Clause Suggestions', 'Compare Contracts'];

const mockResponses = [
  `Based on the analysis of this contract, **Section 27 of the Indian Contract Act 1872** renders most non-compete clauses void as they are considered agreements in restraint of trade.\n\nHowever, non-solicitation clauses with reasonable scope and duration may be enforceable.\n\n> **Key Point:** The 2-year restriction in Clause 11.1 is almost certainly unenforceable in India.`,
  `The termination provisions create a significant imbalance:\n\n1. **Provider** can terminate immediately without cause (Clause 6.1)\n2. **Client** has no corresponding right\n3. Combined with non-refundable fees (Clause 3.5), this creates maximum exposure\n\n**Risk Level: CRITICAL**\n\nRecommend adding mutual termination rights with 30-day notice period.`,
  `The governing law analysis reveals:\n\n- **Clause 9.1** specifies Delaware law\n- **Clause 12.4** specifies San Francisco jurisdiction\n- These are inconsistent and create enforcement complications\n\nUnder the **Arbitration and Conciliation Act 1996**, Indian parties can negotiate for arbitration in India.\n\n> Recommendation: Unify governing law and dispute resolution to Indian jurisdiction.`,
];

export default function ContractWorkspacePage() {
  const { contractId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [contract, setContract] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [contradictions, setContradictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the contract from API
  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getContractById(contractId);
        setContract(data.contract);
        setClauses(data.contract.clauseData || []);
        setContradictions(data.contract.contradictionData || []);
      } catch (err) {
        console.error('Failed to fetch contract:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  // --- OVERVIEW DATA (computed from real clause data) ---
  const riskData = [
    { name: 'Critical', value: clauses.filter(c => c.severity === 'CRITICAL').length || 0, color: '#eb5e28' },
    { name: 'High', value: clauses.filter(c => c.severity === 'HIGH').length || 0, color: '#403d39' },
    { name: 'Medium', value: clauses.filter(c => c.severity === 'MEDIUM').length || 0, color: '#fca311' },
    { name: 'Low', value: clauses.filter(c => c.severity === 'LOW').length || 0, color: '#4a7c59' },
  ];

  // Compute risk categories from actual clause types instead of mock data
  const riskCategoriesComputed = (() => {
    const typeMap = {};
    clauses.forEach(c => {
      if (!typeMap[c.type]) typeMap[c.type] = { scores: [], count: 0 };
      typeMap[c.type].scores.push(c.riskScore || 0);
      typeMap[c.type].count += 1;
    });
    const colors = ['#eb5e28', '#403d39', '#252422', '#ccc5b9', '#fca311', '#4a7c59'];
    return Object.entries(typeMap)
      .map(([name, { scores, count }], i) => ({
        name,
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        count,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.score - a.score);
  })();

  // --- DOCUMENT STATE ---
  const [selectedClauseId, setSelectedClauseId] = useState(null);
  const selectedClause = clauses.find(c => c._id === selectedClauseId);

  // --- FINDINGS STATE ---
  const [findingsFilter, setFindingsFilter] = useState('All');
  const [findingsSearch, setFindingsSearch] = useState('');

  // --- CHAT STATE ---
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const responseIndex = useRef(0);

  // --- CLAUSE SUGGESTIONS STATE ---
  const [accepted, setAccepted] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // --- COMPARE STATE ---
  const [compareTab, setCompareTab] = useState('changes');

  useEffect(() => {
    if (activeTab === 'AI Chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  // Loading state
  if (loading) {
    return (
      <section className="dashboard-main">
        <header className="dashboard-header">
          <span className="label">Loading...</span>
          <h1>Contract<br/>Workspace.</h1>
        </header>
        <div className="empty-state">
          <span className="empty-state-icon" style={{ animation: 'spin 1.5s linear infinite' }}>◉</span>
          <h3>Loading Contract</h3>
          <p>Fetching contract data and analysis results...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !contract) {
    return (
      <section className="dashboard-main">
        <header className="dashboard-header">
          <span className="label">Error</span>
          <h1>Contract<br/>Not Found.</h1>
        </header>
        <div className="empty-state">
          <span className="empty-state-icon">⚠</span>
          <h3>{error || 'Contract not found'}</h3>
          <p>The contract you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </section>
    );
  }

  // ===================== OVERVIEW TAB =====================
  const renderOverview = () => (
    <>
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Overall Risk Score</span>
          <div className="metric-value">{contract.riskScore ?? '—'}<span className="metric-sub">/100</span></div>
          <div className="risk-meter">
            <div className="risk-meter-needle" style={{ left: `${contract.riskScore}%` }} />
          </div>
          <div className="risk-meter-labels">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>
        <div className="metric-card">
          <span className="label">AI Confidence</span>
          <div className="metric-value">{contract.confidence ?? '—'}<span className="metric-sub">%</span></div>
          <div className="metric-desc">Model certainty in analysis accuracy.</div>
        </div>
        <div className="metric-card">
          <span className="label">Clauses Parsed</span>
          <div className="metric-value">{contract.clauses ?? clauses.length}</div>
          <div className="metric-desc">Successfully mapped to taxonomy.</div>
        </div>
        <div className="metric-card">
          <span className="label">Contradictions</span>
          <div className="metric-value">{contract.contradictions ?? contradictions.length}</div>
          <div className="metric-desc">Logical conflicts in graph.</div>
        </div>
      </section>

      {/* DOCUMENT SUMMARY */}
      <section className="dashboard-section">
        <h2>Document Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <span className="label">Document</span>
            <p style={{ wordBreak: 'break-all', fontWeight: 700, marginTop: '0.5rem' }}>{contract.name}</p>
          </div>
          <div>
            <span className="label">Contract Type</span>
            <p style={{ marginTop: '0.5rem' }}><span className="contract-tag">{contract.type}</span></p>
          </div>
          <div>
            <span className="label">Processing Time</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.5rem', marginTop: '0.5rem' }}>{contract.processingTime}</p>
          </div>
          <div>
            <span className="label">Upload Date</span>
            <p style={{ marginTop: '0.5rem' }}>{contract.uploadDate}</p>
          </div>
        </div>
      </section>

      {/* SECONDARY METRICS */}
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="label">Critical Issues</span>
          <div className="metric-value">{clauses.filter(c => c.severity === 'CRITICAL').length}</div>
          <div className="metric-desc">Require immediate review.</div>
        </div>
        <div className="metric-card">
          <span className="label">High Risk</span>
          <div className="metric-value">{clauses.filter(c => c.severity === 'HIGH').length}</div>
          <div className="metric-desc">Significant exposure detected.</div>
        </div>
        <div className="metric-card">
          <span className="label">Medium Risk</span>
          <div className="metric-value">{clauses.filter(c => c.severity === 'MEDIUM').length}</div>
          <div className="metric-desc">Should be reviewed.</div>
        </div>
        <div className="metric-card">
          <span className="label">Low Risk</span>
          <div className="metric-value">{clauses.filter(c => c.severity === 'LOW').length}</div>
          <div className="metric-desc">Generally acceptable.</div>
        </div>
      </section>

      {/* AI SUMMARY */}
      <section className="dashboard-section">
        <div className="ai-summary-block">
          <span className="label">AI Summary</span>
          {contract.summary ? (
            <p style={{ marginTop: '0.75rem' }}>{contract.summary}</p>
          ) : (
            <p style={{ marginTop: '0.75rem' }}>
              This {contract.type} contains {clauses.length} analyzed clauses with an overall risk score of {contract.riskScore}/100.{' '}
              The analysis identified {clauses.filter(c => c.severity === 'CRITICAL').length} critical issues
              {clauses.filter(c => c.severity === 'CRITICAL').length > 0 && ` primarily related to ${clauses.filter(c => c.severity === 'CRITICAL').map(c => c.type.toLowerCase()).join(', ')}`}.{' '}
              {contradictions.length} logical contradictions were detected between clause pairs.
              {contract.riskScore >= 70 && ' Immediate legal review is recommended before execution.'}
              {contract.riskScore >= 50 && contract.riskScore < 70 && ' Review of flagged clauses is recommended.'}
              {contract.riskScore < 50 && ' The contract is generally well-structured with minor concerns.'}
            </p>
          )}
        </div>
      </section>

      {/* DOCUMENT METADATA & EXTRACTED ENTITIES */}
      {(contract.documentMetadata?.word_count > 0 || (contract.entities && contract.entities.length > 0)) && (
        <section className="dashboard-section">
          <h2>Extracted Metadata</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {contract.documentMetadata?.page_count > 0 && (
              <div>
                <span className="label">Pages</span>
                <p style={{ fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Inter, sans-serif', marginTop: '0.25rem' }}>{contract.documentMetadata.page_count}</p>
              </div>
            )}
            {contract.documentMetadata?.word_count > 0 && (
              <div>
                <span className="label">Words</span>
                <p style={{ fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Inter, sans-serif', marginTop: '0.25rem' }}>{contract.documentMetadata.word_count.toLocaleString()}</p>
              </div>
            )}
            {contract.documentMetadata?.file_type && (
              <div>
                <span className="label">File Type</span>
                <p style={{ marginTop: '0.25rem' }}><span className="contract-tag">{contract.documentMetadata.file_type.toUpperCase()}</span></p>
              </div>
            )}
            {contract.documentMetadata?.author && (
              <div>
                <span className="label">Author</span>
                <p style={{ marginTop: '0.25rem' }}>{contract.documentMetadata.author}</p>
              </div>
            )}
          </div>
          {contract.entities && contract.entities.length > 0 && (
            <>
              <h4>Key Entities</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                {contract.entities
                  .filter(e => e.field_name !== 'definition')
                  .map((entity, i) => (
                    <div key={i} style={{ padding: '0.75rem', border: '2px solid var(--dust-grey)', backgroundColor: 'var(--floral-white)' }}>
                      <span className="label" style={{ textTransform: 'capitalize' }}>{entity.field_name.replace(/_/g, ' ')}</span>
                      <p style={{ fontWeight: 700, marginTop: '0.25rem', wordBreak: 'break-word' }}>{entity.value}</p>
                      {entity.confidence < 1 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--charcoal-brown)' }}>Confidence: {Math.round(entity.confidence * 100)}%</span>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* RECOMMENDED ACTIONS */}
      {clauses.filter(c => c.severity === 'CRITICAL' || c.severity === 'HIGH').length > 0 && (
        <section className="dashboard-section">
          <h2>Recommended Actions</h2>
          <div className="recommended-actions">
            {clauses
              .filter(c => c.severity === 'CRITICAL' || c.severity === 'HIGH')
              .sort((a, b) => b.riskScore - a.riskScore)
              .slice(0, 6)
              .map((clause, i) => (
                <div key={clause._id || i} className="recommended-action-item">
                  <div className={`action-priority ${clause.severity.toLowerCase()}`}>{i + 1}</div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    Review Clause {clause.number} ({clause.type}) — {clause.explanation.substring(0, 120)}...
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* RISK BREAKDOWN CHARTS */}
      <section className="dashboard-section">
        <h2>Risk Breakdown</h2>
        <div className="charts-grid">
          <div className="chart-wrapper">
            <h4>Severity Distribution</h4>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {riskData.filter(d => d.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Risk by Category</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskCategoriesComputed} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
                <Bar dataKey="score" fill="#252422">
                  {riskCategoriesComputed.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 80 ? '#eb5e28' : entry.score >= 60 ? '#403d39' : entry.score >= 40 ? '#fca311' : '#4a7c59'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Risk Timeline</h4>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={riskTimeline}>
                <XAxis dataKey="date" tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[40, 100]} tick={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ fontFamily: 'Space Mono', border: '2px solid #252422' }} />
                <Area type="monotone" dataKey="avgRisk" stroke="#eb5e28" fill="rgba(235,94,40,0.1)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h4>Risk Radar</h4>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={riskCategoriesComputed.map(c => ({ subject: c.name, score: c.score, fullMark: 100 }))}>
                <PolarGrid stroke="#ccc5b9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontFamily: 'Space Mono', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} />
                <Radar dataKey="score" stroke="#eb5e28" fill="rgba(235,94,40,0.2)" fillOpacity={0.6} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CRITICAL FINDINGS */}
      {clauses.filter(c => c.severity === 'CRITICAL').length > 0 && (
        <section className="dashboard-section">
          <h2>Critical Findings</h2>
          {clauses.filter(c => c.severity === 'CRITICAL').map((clause) => (
            <div key={clause._id} className={`clause-card risk-indicator-${clause.severity.toLowerCase()}`}>
              <div className="clause-card-header">
                <div>
                  <strong>Clause {clause.number}</strong> — {clause.type}
                  {clause.issueType && <span className="contract-tag" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>{clause.issueType.replace(/_/g, ' ')}</span>}
                </div>
                <span className={`severity-badge ${clause.severity.toLowerCase()}`}>
                  {clause.severity} • {clause.riskScore}/100
                </span>
              </div>
              <div className="clause-card-body">
                <p><strong>Finding:</strong> {clause.explanation}</p>
                {clause.practicalImpact && <p><strong>Practical Impact:</strong> {clause.practicalImpact}</p>}
                <p><strong>Recommendation:</strong> {clause.recommendation}</p>
              </div>
              {(clause.relevantLaw && clause.legalCitationConfidence > 0) && (
                <div className="clause-card-footer">
                  <strong>Relevant Law:</strong> {clause.relevantLaw}
                  <span className="stat-pill" style={{ marginLeft: '0.5rem' }}>Confidence: {clause.legalCitationConfidence}%</span>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* EXPORT & SHARE */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        <h2>Export & Share</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
            ↓ Download Report
          </button>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--carbon-black)' }}>
            ⇗ Share Report
          </button>
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--charcoal-brown)' }}>
            ⎙ Print Report
          </button>
        </div>
      </section>
    </>
  );

  // ===================== DOCUMENT TAB =====================
  const renderDocument = () => (
    <div className="document-split">
      <div className="document-pdf-panel">
        <div className="document-viewer">
          <div style={{ padding: '1rem 0', borderBottom: '2px solid var(--dust-grey)', marginBottom: '1rem' }}>
            <span className="label">Document Viewer</span>
            <h4 style={{ borderBottom: 'none', marginBottom: '0.25rem', marginTop: '0.5rem' }}>{contract.name}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)' }}>Click on any clause to view details →</p>
          </div>
          {clauses.map(clause => (
            <div
              key={clause._id}
              className={`clause-highlight risk-${clause.severity.toLowerCase()} ${selectedClauseId === clause._id ? 'selected' : ''}`}
              onClick={() => setSelectedClauseId(clause._id)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedClauseId === clause._id ? 'var(--dust-grey)' : undefined,
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
              }}
            >
              <strong style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>§ {clause.number} — {clause.type}</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', lineHeight: 1.6 }}>{clause.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="document-detail-panel">
        {selectedClause ? (
          <>
            <div className="detail-section">
              <span className="detail-label">Selected Clause</span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>§ {selectedClause.number} — {selectedClause.type}</h3>
              {selectedClause.issueType && <span className="contract-tag" style={{ marginBottom: '0.5rem', display: 'inline-block', fontSize: '0.75rem' }}>{selectedClause.issueType.replace(/_/g, ' ')}</span>}
              {selectedClause.clauseSummary && <p style={{ color: 'var(--charcoal-brown)', fontStyle: 'italic', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{selectedClause.clauseSummary}</p>}
              <p className="detail-value" style={{ color: 'var(--charcoal-brown)' }}>{selectedClause.text}</p>
            </div>

            <div className="detail-section">
              <span className="detail-label">Analysis</span>
              <p className="detail-value">{selectedClause.explanation}</p>
            </div>

            {selectedClause.practicalImpact && (
              <div className="detail-section">
                <span className="detail-label">Practical Impact</span>
                <p className="detail-value">{selectedClause.practicalImpact}</p>
              </div>
            )}

            <div className="detail-section">
              <span className="detail-label">Severity</span>
              <span className={`severity-badge ${selectedClause.severity.toLowerCase()}`}>{selectedClause.severity}</span>
              <span className="stat-pill" style={{ marginLeft: '0.5rem' }}>Risk: {selectedClause.riskScore}/100</span>
            </div>

            {selectedClause.relevantLaw && selectedClause.legalCitationConfidence > 0 && (
              <div className="detail-section">
                <span className="detail-label">Legal Reference</span>
                <p className="detail-value" style={{ fontSize: '0.9rem' }}>{selectedClause.relevantLaw}</p>
                <span className="stat-pill">Citation Confidence: {selectedClause.legalCitationConfidence}%</span>
              </div>
            )}

            <div className="detail-section">
              <span className="detail-label">Confidence Score</span>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.5rem' }}>{selectedClause.confidence}%</p>
            </div>

            {selectedClause.rewrite && (
              <div className="detail-section">
                <span className="detail-label">AI Suggested Rewrite</span>
                <div style={{ padding: '1rem', border: '2px solid var(--carbon-black)', backgroundColor: 'rgba(74,124,89,0.05)', borderLeft: '4px solid #4a7c59', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{selectedClause.rewrite}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="document-empty-detail">
            <span>◈</span>
            <h3>Select a Clause</h3>
            <p>Click on any clause in the document viewer to see its detailed analysis, severity, legal reference, and AI rewrite.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ===================== FINDINGS TAB =====================
  const FINDING_FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low', 'Contradictions', 'Missing Clauses', 'Liability', 'Termination', 'Confidentiality', 'Jurisdiction'];

  const categorizeClause = (clause) => {
    if (clause.severity === 'CRITICAL') return { category: 'Critical Issues', cssClass: 'critical-issues' };
    if (clause.severity === 'HIGH') return { category: 'High Risk Clauses', cssClass: 'high-risk' };
    if (clause.type.includes('Indemnification') || clause.type.includes('Liability')) return { category: 'One-sided Clauses', cssClass: 'one-sided' };
    return { category: 'Legal Warnings', cssClass: 'legal-warnings' };
  };

  const getFilteredFindings = () => {
    let items = [];

    // Add clauses as findings
    clauses.forEach(clause => {
      const { category, cssClass } = categorizeClause(clause);
      items.push({
        id: `clause-${clause._id}`,
        type: 'clause',
        title: `§ ${clause.number} — ${clause.type}`,
        severity: clause.severity,
        riskScore: clause.riskScore,
        category,
        cssClass,
        text: clause.text,
        clauseSummary: clause.clauseSummary,
        issueType: clause.issueType,
        explanation: clause.explanation,
        practicalImpact: clause.practicalImpact,
        recommendation: clause.recommendation,
        relevantLaw: clause.relevantLaw,
        legalCitationConfidence: clause.legalCitationConfidence,
        clauseType: clause.type,
      });
    });

    // Add contradictions
    contradictions.forEach((contra, idx) => {
      const classLabel = contra.classification || contra.conflictType || 'CONFLICT';
      items.push({
        id: `contra-${contra._id || idx}`,
        type: 'contradiction',
        title: `${classLabel.replace(/_/g, ' ')}: § ${contra.clauseA.number} vs § ${contra.clauseB.number}`,
        severity: contra.severity,
        riskScore: null,
        category: 'Contradictions',
        cssClass: 'contradictions',
        classification: classLabel,
        explanation: contra.explanation,
        resolution: contra.suggestedResolution,
        clauseA: contra.clauseA,
        clauseB: contra.clauseB,
      });
    });

    // Apply filter
    if (findingsFilter !== 'All') {
      items = items.filter(item => {
        if (findingsFilter === 'Critical') return item.severity === 'CRITICAL';
        if (findingsFilter === 'High') return item.severity === 'HIGH';
        if (findingsFilter === 'Medium') return item.severity === 'MEDIUM';
        if (findingsFilter === 'Low') return item.severity === 'LOW';
        if (findingsFilter === 'Contradictions') return item.type === 'contradiction';
        if (findingsFilter === 'Missing Clauses') return item.type === 'missing';
        if (findingsFilter === 'Liability') return item.clauseType?.includes('Liability') || item.clauseType?.includes('Indemnification');
        if (findingsFilter === 'Termination') return item.clauseType?.includes('Termination');
        if (findingsFilter === 'Confidentiality') return item.clauseType?.includes('Confidentiality');
        if (findingsFilter === 'Jurisdiction') return item.clauseType?.includes('Governing') || item.clauseType?.includes('Dispute');
        return true;
      });
    }

    // Apply search
    if (findingsSearch) {
      const q = findingsSearch.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.explanation && item.explanation.toLowerCase().includes(q))
      );
    }

    return items;
  };

  const renderFindings = () => {
    const findings = getFilteredFindings();
    return (
      <>
        <section className="dashboard-section">
          <div className="search-bar" style={{ marginBottom: '1rem' }}>
            <input
              className="search-input"
              placeholder="Search findings..."
              value={findingsSearch}
              onChange={(e) => setFindingsSearch(e.target.value)}
            />
            <button className="search-submit">Search</button>
          </div>
          <div className="filter-tags" style={{ marginBottom: 0 }}>
            {FINDING_FILTERS.map(f => (
              <button key={f} className={`filter-tag ${findingsFilter === f ? 'active' : ''}`} onClick={() => setFindingsFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-section" style={{ borderBottom: 'none' }}>
          <div style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            {findings.length} {findings.length === 1 ? 'finding' : 'findings'}
          </div>

          {findings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">◉</span>
              <h3>No Findings Match</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            findings.map(item => (
              <div key={item.id} className={`finding-card risk-indicator-${item.severity.toLowerCase()}`}>
                <div className="finding-card-header">
                  <div className="finding-card-header-left">
                    <span className={`finding-card-category ${item.cssClass}`}>{item.category}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`severity-badge ${item.severity.toLowerCase()}`}>{item.severity}</span>
                    {item.riskScore !== null && <span className="stat-pill">Risk: {item.riskScore}/100</span>}
                  </div>
                </div>
                <div className="finding-card-body">
                  {item.type === 'clause' && (
                    <>
                      {item.issueType && <span className="contract-tag" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', display: 'inline-block' }}>{item.issueType.replace(/_/g, ' ')}</span>}
                      {item.clauseSummary && <p style={{ color: 'var(--charcoal-brown)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>{item.clauseSummary}</p>}
                      <p style={{ color: 'var(--charcoal-brown)', fontSize: '0.9rem' }}>{item.text}</p>
                      <p><strong>Analysis:</strong> {item.explanation}</p>
                      {item.practicalImpact && <p><strong>Practical Impact:</strong> {item.practicalImpact}</p>}
                      <p><strong>Recommendation:</strong> {item.recommendation}</p>
                    </>
                  )}
                  {item.type === 'contradiction' && (
                    <>
                      {item.classification && <span className="contract-tag" style={{ fontSize: '0.7rem', marginBottom: '0.75rem', display: 'inline-block' }}>{item.classification.replace(/_/g, ' ')}</span>}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div style={{ flex: 1, minWidth: '200px', padding: '1rem', border: '2px solid var(--carbon-black)', borderLeft: '4px solid var(--spicy-paprika)' }}>
                          <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)', fontSize: '0.75rem' }}>§ {item.clauseA.number}</span>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{item.clauseA.text}</p>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px', padding: '1rem', border: '2px solid var(--carbon-black)' }}>
                          <span className="label" style={{ fontSize: '0.75rem' }}>§ {item.clauseB.number}</span>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{item.clauseB.text}</p>
                        </div>
                      </div>
                      <p>{item.explanation}</p>
                      <div style={{ marginTop: '1rem', padding: '1rem', border: '2px solid #4a7c59', backgroundColor: 'rgba(74,124,89,0.05)' }}>
                        <strong>Resolution:</strong> {item.resolution}
                      </div>
                    </>
                  )}
                </div>
                {item.relevantLaw && item.legalCitationConfidence > 0 && (
                  <div className="finding-card-footer">
                    <span><strong>Law:</strong> {item.relevantLaw}</span>
                    <span className="stat-pill" style={{ marginLeft: '0.5rem' }}>Confidence: {item.legalCitationConfidence}%</span>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </>
    );
  };

  // ===================== AI CHAT TAB =====================
  const handleChatSend = async (text) => {
    const messageText = text || chatInput.trim();
    if (!messageText) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const data = await chatWithContract(id, messageText);

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        clauseRefs: data.clause_refs || [],
      };

      setIsTyping(false);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setIsTyping(false);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('> ')) {
        return (
          <blockquote key={i} style={{ borderLeft: '4px solid var(--spicy-paprika)', paddingLeft: '1rem', margin: '0.5rem 0', color: 'var(--charcoal-brown)' }}>
            {renderInline(line.slice(2))}
          </blockquote>
        );
      }
      if (line.startsWith('- ') || line.match(/^\d+\. /)) {
        return <p key={i} style={{ paddingLeft: '1rem', margin: '0.25rem 0' }}>{renderInline(line)}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} style={{ margin: '0.25rem 0' }}>{renderInline(line)}</p>;
    });
  };

  const renderChat = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)', minHeight: '500px' }}>
      <div className="chat-messages" style={{ flexGrow: 1 }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p>{msg.content}</p>}

            {msg.citations && msg.citations.length > 0 && (
              <div className="chat-citations">
                {msg.citations.map((cite, i) => (
                  <span key={i} className="citation-tag">
                    {cite.law} — {cite.section}
                  </span>
                ))}
                {msg.clauseRefs && msg.clauseRefs.map((ref, i) => (
                  <span key={`ref-${i}`} className="citation-tag" style={{ backgroundColor: 'rgba(235,94,40,0.1)', borderColor: 'var(--spicy-paprika)' }}>
                    § Clause {ref}
                  </span>
                ))}
              </div>
            )}

            <div className="chat-message-time">{msg.timestamp}</div>
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="suggested-questions">
        {suggestedQuestions.slice(0, 4).map((q, i) => (
          <button key={i} className="suggested-q-btn" onClick={() => handleChatSend(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="chat-input-container" style={{ flexShrink: 0 }}>
        <textarea
          className="chat-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleChatKeyDown}
          placeholder="Ask about clauses, risks, or legal implications..."
          rows={1}
        />
        <button className="chat-send-btn" onClick={() => handleChatSend()} disabled={isTyping}>
          SEND →
        </button>
      </div>
    </div>
  );

  // ===================== CLAUSE SUGGESTIONS TAB =====================
  const riskyClauses = clauses.filter(c => c.riskScore >= 40);

  const handleCopy = (clauseId, rewriteText) => {
    navigator.clipboard?.writeText(rewriteText);
    setCopiedId(clauseId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAccept = (clauseId) => {
    setAccepted(prev => ({ ...prev, [clauseId]: true }));
  };

  const renderClauseSuggestions = () => (
    <section className="dashboard-section" style={{ borderBottom: 'none' }}>
      <h2>Clause Suggestions ({riskyClauses.length})</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--charcoal-brown)' }}>
        AI-generated rewrites for all risky clauses. Review, accept, or copy the suggested improvements.
      </p>

      {riskyClauses.map(clause => {
        const riskReduction = Math.round(clause.riskScore * 0.4);
        return (
          <div key={clause._id} className="clause-suggestion-card">
            <div className="clause-suggestion-header">
              <div>
                <strong>§ {clause.number} — {clause.type}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`severity-badge ${clause.severity.toLowerCase()}`}>{clause.severity}</span>
                <span className="stat-pill negative">Risk: {clause.riskScore}/100</span>
                {accepted[clause._id] && <span className="stat-pill positive">✓ Accepted</span>}
              </div>
            </div>

            <div className="clause-suggestion-original">
              <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)', fontSize: '0.75rem' }}>Original Clause</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{clause.text}</p>
            </div>

            <div className="clause-suggestion-reason">
              <span className="label" style={{ fontSize: '0.75rem' }}>Why It's Risky</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{clause.explanation}</p>
            </div>

            <div className="clause-suggestion-rewrite">
              <span className="label" style={{ color: '#4a7c59', borderColor: '#4a7c59', fontSize: '0.75rem' }}>AI Suggested Rewrite</span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{clause.rewrite}</p>
            </div>

            <div className="clause-suggestion-improvement">
              <span className="label" style={{ fontSize: '0.75rem' }}>Risk Improvement</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className="stat-pill positive">
                  −{riskReduction} points → {clause.riskScore - riskReduction}/100
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--charcoal-brown)' }}>
                  Based on: {clause.relevantLaw}
                </span>
              </div>
            </div>

            <div className="clause-suggestion-actions">
              <button
                className="btn-small"
                style={{
                  backgroundColor: accepted[clause._id] ? '#4a7c59' : 'var(--carbon-black)',
                  color: 'var(--floral-white)',
                }}
                onClick={() => handleAccept(clause._id)}
              >
                {accepted[clause._id] ? '✓ Accepted' : '✓ Accept'}
              </button>
              <button className="btn-small" onClick={() => handleCopy(clause._id, clause.rewrite)}>
                {copiedId === clause._id ? '✓ Copied' : '⎘ Copy'}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );

  // ===================== COMPARE CONTRACTS TAB =====================
  const { version1, version2, changes, riskDifference } = versionDiffData;

  const getChangeIcon = (type) => {
    switch (type) {
      case 'added': return '+';
      case 'deleted': return '−';
      case 'modified': return '~';
      default: return '•';
    }
  };

  const renderCompare = () => (
    <>
      {/* UPLOAD SECOND VERSION */}
      <div className="compare-upload-section">
        <div className="compare-upload-zone">
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⇄</span>
          <h3>Upload Second Version</h3>
          <p style={{ color: 'var(--charcoal-brown)', marginTop: '0.5rem' }}>
            Drop a revised version of this contract to compare changes.
          </p>
          <button className="upload-btn-inline" style={{ marginTop: '1rem' }}>Select File</button>
        </div>
      </div>

      {/* VERSION COMPARISON */}
      <div className="split-layout">
        <div className="split-left" style={{ padding: '1.5rem' }}>
          <span className="label">Version 1 — Base</span>
          <h3 style={{ wordBreak: 'break-all', marginTop: '0.5rem' }}>{version1.name}</h3>
          <p className="file-card-meta" style={{ marginTop: '0.5rem' }}>
            {version1.date} • {version1.clauses} clauses • Risk: {version1.riskScore}/100
          </p>
          <div className="risk-meter" style={{ marginTop: '1rem' }}>
            <div className="risk-meter-needle" style={{ left: `${version1.riskScore}%` }} />
          </div>
        </div>
        <div className="split-right" style={{ padding: '1.5rem' }}>
          <span className="label" style={{ color: 'var(--spicy-paprika)', borderColor: 'var(--spicy-paprika)' }}>Version 2 — Redline</span>
          <h3 style={{ wordBreak: 'break-all', marginTop: '0.5rem' }}>{version2.name}</h3>
          <p className="file-card-meta" style={{ marginTop: '0.5rem' }}>
            {version2.date} • {version2.clauses} clauses • Risk: {version2.riskScore}/100
          </p>
          <div className="risk-meter" style={{ marginTop: '1rem' }}>
            <div className="risk-meter-needle" style={{ left: `${version2.riskScore}%` }} />
          </div>
        </div>
      </div>

      {/* RISK DIFFERENCE */}
      <section className="metrics-grid">
        <div className="metric-card risk-critical">
          <span className="label">Overall Risk Change</span>
          <div className="metric-value">+{riskDifference.overall}</div>
          <div className="metric-desc">Risk score increased from v1 to v2.</div>
        </div>
        <div className="metric-card">
          <span className="label">New Critical</span>
          <div className="metric-value">+{riskDifference.critical}</div>
          <div className="metric-desc">Additional critical issues.</div>
        </div>
        <div className="metric-card">
          <span className="label">New High</span>
          <div className="metric-value">+{riskDifference.high}</div>
          <div className="metric-desc">Additional high-risk clauses.</div>
        </div>
        <div className="metric-card">
          <span className="label">Total Changes</span>
          <div className="metric-value">{changes.length}</div>
          <div className="metric-desc">Clauses added, deleted, or modified.</div>
        </div>
      </section>

      {/* AI DIFFERENCE SUMMARY */}
      <section className="dashboard-section">
        <div className="ai-summary-block">
          <span className="label">AI Summary of Differences</span>
          <p style={{ marginTop: '0.75rem' }}>
            Version 2 introduces significant risk increases across {changes.length} clause changes. The most concerning additions include
            a blanket liability exclusion (Clause 4.1, +20 risk), a one-sided indemnification clause (Clause 4.2, +78 risk),
            and an unenforceable non-compete (Clause 11.1, +90 risk). The removal of the mutual NDA (Clause 8.2)
            eliminates important confidentiality protections. Overall risk score increased from {version1.riskScore} to {version2.riskScore},
            with 3 new critical-severity issues. Immediate legal review is strongly recommended before accepting these changes.
          </p>
        </div>
      </section>

      {/* CHANGE FILTER TABS */}
      <div className="tabs-container">
        <button className={`tab-btn ${compareTab === 'changes' ? 'active' : ''}`} onClick={() => setCompareTab('changes')}>
          All Changes ({changes.length})
        </button>
        <button className={`tab-btn ${compareTab === 'added' ? 'active' : ''}`} onClick={() => setCompareTab('added')}>
          Added ({changes.filter(c => c.type === 'added').length})
        </button>
        <button className={`tab-btn ${compareTab === 'deleted' ? 'active' : ''}`} onClick={() => setCompareTab('deleted')}>
          Deleted ({changes.filter(c => c.type === 'deleted').length})
        </button>
        <button className={`tab-btn ${compareTab === 'modified' ? 'active' : ''}`} onClick={() => setCompareTab('modified')}>
          Modified ({changes.filter(c => c.type === 'modified').length})
        </button>
      </div>

      {/* CHANGE CARDS */}
      <section className="dashboard-section" style={{ borderBottom: 'none' }}>
        {changes
          .filter(c => compareTab === 'changes' || c.type === compareTab)
          .map((change) => (
            <div key={change.id} className="clause-card" style={{ cursor: 'default' }}>
              <div className="clause-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '1.2rem',
                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--carbon-black)',
                    backgroundColor: change.type === 'added' ? '#4a7c59' : change.type === 'deleted' ? 'var(--spicy-paprika)' : '#fca311',
                    color: change.type === 'modified' ? 'var(--carbon-black)' : 'var(--floral-white)',
                  }}>
                    {getChangeIcon(change.type)}
                  </span>
                  <div>
                    <strong>Clause {change.clause}</strong> — {change.label}
                    <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-brown)', textTransform: 'uppercase' }}>{change.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`severity-badge ${change.severity.toLowerCase()}`}>{change.severity}</span>
                  <span className={`stat-pill ${change.riskChange > 0 ? 'negative' : 'positive'}`}>
                    {change.riskChange > 0 ? '+' : ''}{change.riskChange} Risk
                  </span>
                </div>
              </div>
              <div className="clause-card-body">
                {change.v1Text && (
                  <div className={change.type === 'deleted' ? 'diff-deleted' : 'diff-modified'}>
                    <span className="label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>V1 — Original</span>
                    <p style={{ marginTop: '0.25rem' }}>{change.v1Text}</p>
                  </div>
                )}
                {change.v2Text && (
                  <div className={change.type === 'added' ? 'diff-added' : change.type === 'modified' ? 'diff-added' : ''}>
                    <span className="label" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', color: '#4a7c59', borderColor: '#4a7c59' }}>V2 — Redline</span>
                    <p style={{ marginTop: '0.25rem' }}>{change.v2Text}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </section>
    </>
  );

  // ===================== RENDER =====================
  return (
    <section className="dashboard-main">
      <header className="dashboard-header">
        <span className="label">Active Contract — {contract.type}</span>
        <h1>Contract<br/>Workspace.</h1>
      </header>

      <div className="tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && renderOverview()}
      {activeTab === 'Document' && renderDocument()}
      {activeTab === 'Findings' && renderFindings()}
      {activeTab === 'AI Chat' && renderChat()}
      {activeTab === 'Clause Suggestions' && renderClauseSuggestions()}
      {activeTab === 'Compare Contracts' && renderCompare()}
    </section>
  );
}
