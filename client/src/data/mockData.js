// =========================================
// CENTRALIZED MOCK DATA
// All pages import from here for consistency
// =========================================

export const currentUser = {
  id: 'USR_9402',
  name: 'Ritesh Kumar',
  email: 'ritesh@lawfirm.co.in',
  role: 'Enterprise',
  avatar: null,
  company: 'Kumar & Associates LLP',
  phone: '+91 98765 43210',
  joinDate: '2025-03-15',
  plan: 'Enterprise',
  documentsUsed: 47,
  documentsLimit: 'Unlimited',
  lastLogin: '2026-07-24T14:30:00Z',
};

export const dashboardStats = {
  documentsUploaded: 47,
  activeAnalyses: 3,
  riskScoreAvg: 72,
  contractsReviewed: 124,
  contradictionsFound: 18,
  clausesRewritten: 31,
};

export const contracts = [
  {
    id: 'CTR_001',
    name: 'SaaS_License_Agreement_v3.2.pdf',
    type: 'SaaS Agreement',
    uploadDate: '2026-07-24',
    status: 'Analyzed',
    riskScore: 84,
    clauses: 42,
    contradictions: 3,
    severity: 'CRITICAL',
    processingTime: '12.4s',
    confidence: 94,
  },
  {
    id: 'CTR_002',
    name: 'Employment_Contract_Ravi_Sharma.docx',
    type: 'Employment Contract',
    uploadDate: '2026-07-22',
    status: 'Analyzed',
    riskScore: 56,
    clauses: 28,
    contradictions: 1,
    severity: 'MEDIUM',
    processingTime: '8.7s',
    confidence: 91,
  },
  {
    id: 'CTR_003',
    name: 'NDA_TechVentures_2026.pdf',
    type: 'Non-Disclosure (NDA)',
    uploadDate: '2026-07-20',
    status: 'Analyzed',
    riskScore: 32,
    clauses: 15,
    contradictions: 0,
    severity: 'LOW',
    processingTime: '5.2s',
    confidence: 97,
  },
  {
    id: 'CTR_004',
    name: 'Vendor_Supply_Agreement_Q3.pdf',
    type: 'Vendor / Supply',
    uploadDate: '2026-07-18',
    status: 'Analyzed',
    riskScore: 71,
    clauses: 35,
    contradictions: 2,
    severity: 'HIGH',
    processingTime: '10.1s',
    confidence: 89,
  },
  {
    id: 'CTR_005',
    name: 'Co_Founder_Terms_StartupXYZ.docx',
    type: 'Co-Founder Terms',
    uploadDate: '2026-07-15',
    status: 'Processing',
    riskScore: null,
    clauses: null,
    contradictions: null,
    severity: null,
    processingTime: null,
    confidence: null,
  },
  {
    id: 'CTR_006',
    name: 'Lease_Agreement_Office_Block_C.pdf',
    type: 'Lease / Rental',
    uploadDate: '2026-07-12',
    status: 'Analyzed',
    riskScore: 45,
    clauses: 22,
    contradictions: 1,
    severity: 'MEDIUM',
    processingTime: '7.3s',
    confidence: 93,
  },
  {
    id: 'CTR_007',
    name: 'Freelancer_Services_Priya_M.pdf',
    type: 'Freelancer Services',
    uploadDate: '2026-07-10',
    status: 'Analyzed',
    riskScore: 28,
    clauses: 12,
    contradictions: 0,
    severity: 'LOW',
    processingTime: '4.8s',
    confidence: 96,
  },
];

export const clauses = [
  {
    id: 1,
    number: '4.1',
    type: 'Limitation of Liability',
    text: 'The Service Provider shall not be liable for any indirect, incidental, special, consequential, or punitive damages, regardless of cause of action or the theory of liability, even if the Service Provider has been advised of the possibility of such damages.',
    riskScore: 92,
    severity: 'CRITICAL',
    confidence: 96,
    explanation: 'This clause attempts to eliminate all forms of indirect liability, which is overly broad and potentially unenforceable under the Indian Consumer Protection Act 2019. It does not carve out exceptions for gross negligence or willful misconduct.',
    recommendation: 'Add carve-outs for gross negligence, willful misconduct, and breaches of confidentiality. Cap liability at a reasonable multiple of fees paid.',
    relevantLaw: 'Indian Consumer Protection Act 2019, Section 2(6); Indian Contract Act 1872, Section 73-74',
    rewrite: 'The Service Provider\'s total aggregate liability under this Agreement shall not exceed the total fees paid by the Client in the twelve (12) months preceding the claim, except in cases of gross negligence, willful misconduct, or breach of confidentiality obligations.',
  },
  {
    id: 2,
    number: '4.2',
    type: 'Indemnification',
    text: 'The Client shall indemnify, defend, and hold harmless the Service Provider and its affiliates, officers, agents, and employees from and against any and all claims, liabilities, damages, losses, and expenses arising out of or in any way connected with the Client\'s use of the Services.',
    riskScore: 78,
    severity: 'HIGH',
    confidence: 93,
    explanation: 'One-sided indemnification clause that places the entire burden on the Client without reciprocal obligations from the Service Provider. This creates an asymmetric risk allocation.',
    recommendation: 'Make indemnification mutual. Each party should indemnify the other for breaches of their representations, warranties, and obligations under the agreement.',
    relevantLaw: 'Indian Contract Act 1872, Section 124-125',
    rewrite: 'Each party shall indemnify and hold harmless the other party from and against any claims, liabilities, and expenses arising from (a) the indemnifying party\'s breach of this Agreement, (b) the indemnifying party\'s negligence or willful misconduct.',
  },
  {
    id: 3,
    number: '6.1',
    type: 'Termination',
    text: 'The Service Provider may terminate this Agreement at any time, for any reason, with immediate effect upon written notice to the Client.',
    riskScore: 85,
    severity: 'CRITICAL',
    confidence: 95,
    explanation: 'Unilateral termination right without notice period or cure period is highly prejudicial to the Client. No provision for refund of prepaid fees upon termination.',
    recommendation: 'Add minimum 30-day notice period, cure period for material breaches, and pro-rata refund provisions for prepaid fees.',
    relevantLaw: 'Indian Contract Act 1872, Section 62; IT Act 2000, Section 43A',
    rewrite: 'Either party may terminate this Agreement by providing thirty (30) days\' prior written notice. In case of material breach, the non-breaching party may terminate upon fifteen (15) days\' written notice if such breach remains uncured.',
  },
  {
    id: 4,
    number: '7.3',
    type: 'Data Privacy',
    text: 'The Client acknowledges that the Service Provider may collect, process, and share the Client\'s data with third-party service providers as necessary for the operation of the Services.',
    riskScore: 68,
    severity: 'HIGH',
    confidence: 91,
    explanation: 'Vague data sharing provisions without specifying the categories of data, purposes, or safeguards. Does not comply with emerging Indian data protection standards.',
    recommendation: 'Specify data categories, processing purposes, third-party obligations, data retention periods, and breach notification procedures.',
    relevantLaw: 'Information Technology Act 2000, Section 43A; Digital Personal Data Protection Act 2023',
    rewrite: 'The Service Provider shall process Client data solely for purposes specified in Schedule A. Any sharing with sub-processors requires prior written consent and equivalent data protection obligations. The Service Provider shall notify the Client within 72 hours of any data breach.',
  },
  {
    id: 5,
    number: '9.1',
    type: 'Governing Law',
    text: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States.',
    riskScore: 55,
    severity: 'MEDIUM',
    confidence: 88,
    explanation: 'For an Indian party, agreeing to Delaware jurisdiction creates significant enforcement challenges and increased litigation costs. Indian courts may not recognize foreign judgments easily.',
    recommendation: 'Negotiate for Indian governing law or at minimum include arbitration in a neutral venue.',
    relevantLaw: 'Indian Arbitration and Conciliation Act 1996, Section 28; Code of Civil Procedure 1908',
    rewrite: 'This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be resolved through arbitration in New Delhi under the Arbitration and Conciliation Act, 1996.',
  },
  {
    id: 6,
    number: '10.2',
    type: 'Intellectual Property',
    text: 'All intellectual property created during the course of this Agreement, including but not limited to software, documentation, and inventions, shall be the sole and exclusive property of the Service Provider.',
    riskScore: 72,
    severity: 'HIGH',
    confidence: 90,
    explanation: 'This clause assigns all IP rights to the Service Provider, including potentially pre-existing IP of the Client. This is overly broad and may conflict with the Client\'s existing IP portfolio.',
    recommendation: 'Distinguish between pre-existing IP (retained by each party), jointly developed IP, and commissioned work. Ensure Client retains rights to their pre-existing materials.',
    relevantLaw: 'Indian Copyright Act 1957, Section 17; Patents Act 1970',
    rewrite: 'Each party retains ownership of its pre-existing intellectual property. IP specifically commissioned and paid for by the Client shall vest with the Client. The Service Provider retains IP in its platform, tools, and generic methodologies.',
  },
  {
    id: 7,
    number: '11.1',
    type: 'Non-Compete',
    text: 'The Client agrees not to engage in any business that competes with the Service Provider\'s business for a period of two (2) years following termination of this Agreement.',
    riskScore: 90,
    severity: 'CRITICAL',
    confidence: 94,
    explanation: 'Non-compete clauses in service agreements are generally unenforceable in India under Section 27 of the Indian Contract Act, which considers agreements in restraint of trade void.',
    recommendation: 'Remove entirely or replace with a narrowly tailored non-solicitation clause limited to employees/clients directly involved in the engagement.',
    relevantLaw: 'Indian Contract Act 1872, Section 27; Niranjan Shankar Golikari v. Century Spinning (1967)',
    rewrite: 'During the term and for six (6) months thereafter, neither party shall directly solicit for employment any personnel of the other party who were materially involved in performing obligations under this Agreement.',
  },
  {
    id: 8,
    number: '12.4',
    type: 'Dispute Resolution',
    text: 'Any disputes arising out of this Agreement shall be submitted to the exclusive jurisdiction of the courts in San Francisco, California.',
    riskScore: 48,
    severity: 'MEDIUM',
    confidence: 87,
    explanation: 'Exclusive foreign jurisdiction clauses are difficult to enforce against Indian parties. The clause lacks an arbitration mechanism which is typically preferred for cross-border disputes.',
    recommendation: 'Include binding arbitration with a neutral seat, preferably in India or Singapore.',
    relevantLaw: 'Arbitration and Conciliation Act 1996; Code of Civil Procedure 1908, Section 20',
    rewrite: 'Any dispute arising out of or in connection with this Agreement shall be resolved through binding arbitration administered in accordance with the rules of the Mumbai Centre for International Arbitration (MCIA).',
  },
  {
    id: 9,
    number: '3.5',
    type: 'Payment Terms',
    text: 'All fees are non-refundable. The Client shall pay all invoices within fifteen (15) days of receipt. Late payments shall accrue interest at the rate of 2% per month.',
    riskScore: 42,
    severity: 'MEDIUM',
    confidence: 89,
    explanation: 'The 2% monthly interest rate (24% annually) may be considered penal and unenforceable. The blanket non-refund policy conflicts with consumer protection provisions.',
    recommendation: 'Reduce interest rate to a reasonable level (12-15% annually). Add pro-rata refund provisions for unused services.',
    relevantLaw: 'Indian Contract Act 1872, Section 74; Consumer Protection Act 2019',
    rewrite: 'Fees for unused services are refundable on a pro-rata basis. Payment is due within thirty (30) days of invoice. Late payments accrue interest at 1.5% per month or the maximum rate permitted by law, whichever is lower.',
  },
  {
    id: 10,
    number: '5.2',
    type: 'Confidentiality',
    text: 'The Client\'s obligation of confidentiality shall survive for a period of five (5) years following termination. The Service Provider\'s confidentiality obligations shall terminate upon expiration of this Agreement.',
    riskScore: 35,
    severity: 'LOW',
    confidence: 92,
    explanation: 'Asymmetric confidentiality obligations where the Client is bound for 5 years post-termination but the Service Provider\'s obligations end at termination. This is unbalanced.',
    recommendation: 'Make survival period mutual and equal for both parties.',
    relevantLaw: 'Indian Contract Act 1872, Section 23',
    rewrite: 'Each party\'s confidentiality obligations shall survive termination for a period of three (3) years. Trade secrets shall be protected indefinitely.',
  },
];

export const contradictions = [
  {
    id: 'CONTRA_001',
    clauseA: { number: '4.1', type: 'Limitation of Liability', text: 'The Service Provider shall not be liable for any indirect, incidental, special, consequential, or punitive damages...' },
    clauseB: { number: '4.2', type: 'Indemnification', text: 'The Client shall indemnify... from and against any and all claims, liabilities, damages, losses...' },
    conflictType: 'LOGICAL CONTRADICTION',
    severity: 'CRITICAL',
    explanation: 'Clause 4.1 eliminates Provider liability for indirect damages, but Clause 4.2 requires the Client to indemnify Provider for "all damages" including indirect ones. This creates an asymmetric liability structure where the Client bears unlimited exposure while the Provider bears none.',
    suggestedResolution: 'Align both clauses: either make indemnification subject to the same liability caps, or remove the blanket liability exclusion from 4.1.',
  },
  {
    id: 'CONTRA_002',
    clauseA: { number: '6.1', type: 'Termination', text: 'The Service Provider may terminate this Agreement at any time, for any reason, with immediate effect...' },
    clauseB: { number: '3.5', type: 'Payment Terms', text: 'All fees are non-refundable...' },
    conflictType: 'UNFAIR COUPLING',
    severity: 'HIGH',
    explanation: 'The Provider can terminate immediately (6.1) while fees remain non-refundable (3.5). This means the Provider could collect annual fees then terminate the next day with no recourse for the Client.',
    suggestedResolution: 'Add a pro-rata refund provision triggered by Provider-initiated termination without cause.',
  },
  {
    id: 'CONTRA_003',
    clauseA: { number: '9.1', type: 'Governing Law', text: 'This Agreement shall be governed by... the laws of the State of Delaware...' },
    clauseB: { number: '12.4', type: 'Dispute Resolution', text: 'Any disputes... shall be submitted to the exclusive jurisdiction of the courts in San Francisco, California.' },
    conflictType: 'JURISDICTION MISMATCH',
    severity: 'MEDIUM',
    explanation: 'The governing law is Delaware but the dispute jurisdiction is California. This creates confusion about which state\'s procedural rules apply and may lead to conflict-of-laws issues.',
    suggestedResolution: 'Unify governing law and dispute resolution jurisdiction to the same state, or use arbitration to avoid the conflict entirely.',
  },
];

export const riskCategories = [
  { name: 'Liability', score: 88, count: 3, color: '#eb5e28' },
  { name: 'Termination', score: 75, count: 2, color: '#403d39' },
  { name: 'IP Rights', score: 72, count: 2, color: '#252422' },
  { name: 'Data Privacy', score: 68, count: 1, color: '#ccc5b9' },
  { name: 'Jurisdiction', score: 52, count: 2, color: '#eb5e28' },
  { name: 'Payment', score: 42, count: 1, color: '#403d39' },
  { name: 'Confidentiality', score: 35, count: 1, color: '#252422' },
  { name: 'Non-Compete', score: 90, count: 1, color: '#eb5e28' },
];

export const monthlyUploads = [
  { month: 'Jan', uploads: 8 },
  { month: 'Feb', uploads: 12 },
  { month: 'Mar', uploads: 15 },
  { month: 'Apr', uploads: 10 },
  { month: 'May', uploads: 22 },
  { month: 'Jun', uploads: 18 },
  { month: 'Jul', uploads: 25 },
];

export const contractTypeDistribution = [
  { type: 'SaaS', count: 15 },
  { type: 'Employment', count: 12 },
  { type: 'NDA', count: 20 },
  { type: 'Vendor', count: 8 },
  { type: 'Lease', count: 6 },
  { type: 'Freelance', count: 10 },
];

export const riskTimeline = [
  { date: 'Week 1', avgRisk: 72, high: 3, medium: 5, low: 8 },
  { date: 'Week 2', avgRisk: 68, high: 2, medium: 6, low: 9 },
  { date: 'Week 3', avgRisk: 75, high: 4, medium: 4, low: 7 },
  { date: 'Week 4', avgRisk: 64, high: 2, medium: 5, low: 10 },
  { date: 'Week 5', avgRisk: 58, high: 1, medium: 4, low: 12 },
  { date: 'Week 6', avgRisk: 71, high: 3, medium: 6, low: 8 },
];

export const recentActivity = [
  { id: 1, action: 'Uploaded', target: 'SaaS_License_Agreement_v3.2.pdf', time: '2 hours ago', type: 'upload' },
  { id: 2, action: 'Analysis Complete', target: 'Employment_Contract_Ravi_Sharma.docx', time: '5 hours ago', type: 'analysis' },
  { id: 3, action: 'Clause Rewritten', target: 'Clause 4.1 — Limitation of Liability', time: '1 day ago', type: 'rewrite' },
  { id: 4, action: 'Contradiction Detected', target: 'Vendor_Supply_Agreement_Q3.pdf', time: '1 day ago', type: 'contradiction' },
  { id: 5, action: 'Report Downloaded', target: 'NDA_TechVentures_2026_Report.pdf', time: '2 days ago', type: 'download' },
  { id: 6, action: 'Uploaded', target: 'Co_Founder_Terms_StartupXYZ.docx', time: '3 days ago', type: 'upload' },
  { id: 7, action: 'Version Compared', target: 'Lease_Agreement v1 vs v2', time: '4 days ago', type: 'compare' },
  { id: 8, action: 'AI Chat Session', target: 'Re: Indemnification clause validity', time: '5 days ago', type: 'chat' },
];

export const notifications = [
  { id: 1, type: 'success', title: 'Analysis Complete', message: 'SaaS_License_Agreement_v3.2.pdf has been fully analyzed. 3 contradictions detected.', time: '2 hours ago', read: false },
  { id: 2, type: 'warning', title: 'High Risk Detected', message: 'Employment Contract scored 56/100. Review recommended for Clause 7 and 11.', time: '5 hours ago', read: false },
  { id: 3, type: 'info', title: 'New Feature Available', message: 'Clause Rewrite Engine v2.0 is now available with improved suggestions.', time: '1 day ago', read: true },
  { id: 4, type: 'error', title: 'Processing Failed', message: 'Co_Founder_Terms_StartupXYZ.docx failed OCR extraction. Please re-upload.', time: '3 days ago', read: true },
  { id: 5, type: 'success', title: 'Report Exported', message: 'NDA_TechVentures_2026 risk report exported successfully as PDF.', time: '4 days ago', read: true },
  { id: 6, type: 'info', title: 'Weekly Summary', message: 'You analyzed 12 contracts this week. Average risk score: 58.', time: '5 days ago', read: true },
  { id: 7, type: 'warning', title: 'Subscription Renewal', message: 'Your Enterprise plan renews on Aug 15, 2026.', time: '1 week ago', read: true },
];

export const chatMessages = [
  {
    id: 1,
    role: 'user',
    content: 'What are the main risks in Clause 4.1 regarding limitation of liability?',
    timestamp: '14:22',
  },
  {
    id: 2,
    role: 'assistant',
    content: `**Clause 4.1 — Limitation of Liability** presents several critical risks:

1. **Blanket Exclusion**: The clause eliminates liability for *all* indirect damages, which is overly broad. Under **Section 73 of the Indian Contract Act 1872**, parties are entitled to compensation for losses naturally arising from breach.

2. **No Gross Negligence Carve-out**: The clause does not exempt gross negligence or willful misconduct from the liability cap, which most standard agreements include.

3. **Consumer Protection Conflict**: Under the **Consumer Protection Act 2019, Section 2(6)**, such blanket exclusions may be deemed unfair trade practices if the service is consumed by individuals.

> **Risk Score: 92/100 (CRITICAL)**

**Recommendation**: Add carve-outs for gross negligence, cap liability at 12 months of fees paid, and ensure compliance with Indian consumer protection standards.`,
    timestamp: '14:22',
    citations: [
      { law: 'Indian Contract Act 1872', section: 'Section 73-74' },
      { law: 'Consumer Protection Act 2019', section: 'Section 2(6)' },
    ],
    clauseRefs: ['4.1'],
  },
  {
    id: 3,
    role: 'user',
    content: 'How does Clause 4.1 contradict Clause 4.2 on indemnification?',
    timestamp: '14:24',
  },
  {
    id: 4,
    role: 'assistant',
    content: `The contradiction between **Clause 4.1** and **Clause 4.2** is a classic example of asymmetric risk allocation:

**The Conflict:**
- **Clause 4.1** states the Provider is not liable for any indirect/consequential damages
- **Clause 4.2** requires the Client to indemnify the Provider against *all* claims, damages, and losses — which includes indirect damages

This means the Client must cover the Provider's indirect losses, but the Provider is shielded from the Client's indirect losses.

**Legal Analysis:**
Under **Section 23 of the Indian Contract Act**, considerations or objects that are unconscionable may be deemed unlawful. While this clause alone may not meet that threshold, combined with the one-sided termination rights in Clause 6.1, it creates a pattern of unconscionability.

> **Conflict Type: LOGICAL CONTRADICTION**
> **Severity: CRITICAL**

**Suggested Resolution**: Make indemnification mutual and subject to the same liability caps defined in Clause 4.1.`,
    timestamp: '14:24',
    citations: [
      { law: 'Indian Contract Act 1872', section: 'Section 23' },
      { law: 'Indian Contract Act 1872', section: 'Section 124-125' },
    ],
    clauseRefs: ['4.1', '4.2'],
  },
];

export const suggestedQuestions = [
  'What are the top 3 riskiest clauses in this contract?',
  'Is the non-compete clause enforceable under Indian law?',
  'Compare the termination rights of both parties.',
  'What data protection issues exist in this agreement?',
  'Summarize all jurisdiction-related concerns.',
  'What is the overall enforceability of this contract?',
];

export const knowledgeBase = [
  {
    id: 'KB_001',
    category: 'IPC',
    title: 'Indian Penal Code — Fraud and Cheating',
    description: 'Section 415-420 of the IPC deal with cheating and dishonestly inducing delivery of property. Relevant when contract terms are deliberately misleading.',
    content: 'Section 415 defines cheating as deliberately deceiving someone, causing them to deliver property or alter/destroy valuable security. Section 420 prescribes imprisonment up to 7 years and fine for cheating causing wrongful gain.',
    bookmarked: false,
  },
  {
    id: 'KB_002',
    category: 'Consumer Protection',
    title: 'Consumer Protection Act 2019 — Unfair Contracts',
    description: 'Section 2(46) defines unfair contracts. One-sided terms, excessive penalties, and unilateral termination rights may be challenged under this act.',
    content: 'An unfair contract means a contract between a manufacturer or trader and a consumer, having such terms which cause significant change in the rights of such consumer, including requiring manifestly excessive security deposits, imposing penalty disproportionate to the loss.',
    bookmarked: true,
  },
  {
    id: 'KB_003',
    category: 'IT Act',
    title: 'Information Technology Act 2000 — Data Protection',
    description: 'Section 43A mandates reasonable security practices for handling sensitive personal data. Failure attracts compensation.',
    content: 'Where a body corporate, possessing, dealing or handling any sensitive personal data or information in a computer resource which it owns, controls or operates, is negligent in implementing and maintaining reasonable security practices, it shall be liable to pay damages to the person affected.',
    bookmarked: false,
  },
  {
    id: 'KB_004',
    category: 'Contract Act',
    title: 'Indian Contract Act 1872 — Agreements in Restraint of Trade',
    description: 'Section 27 declares every agreement in restraint of trade void, with limited exceptions for sale of goodwill.',
    content: 'Every agreement by which anyone is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Exception: the seller of goodwill may agree not to carry on similar business within specified local limits.',
    bookmarked: true,
  },
  {
    id: 'KB_005',
    category: 'Arbitration',
    title: 'Arbitration and Conciliation Act 1996 — Seat vs Venue',
    description: 'Understanding the distinction between seat and venue of arbitration is critical for determining curial law and enforceability.',
    content: 'The "seat" of arbitration determines the curial law (procedural law) governing the arbitration. The "venue" is merely the physical location where hearings are held. Indian courts have held that designation of seat confers exclusive supervisory jurisdiction to courts at that seat.',
    bookmarked: false,
  },
  {
    id: 'KB_006',
    category: 'Consumer Protection',
    title: 'E-Commerce Guidelines — Consumer Protection',
    description: 'Consumer Protection (E-Commerce) Rules 2020 impose specific obligations on e-commerce entities regarding contract display and grievance redressal.',
    content: 'Every e-commerce entity shall display terms and conditions clearly, provide details about return/refund/exchange/warranty, and appoint a grievance officer who shall acknowledge consumer complaint within 48 hours.',
    bookmarked: false,
  },
  {
    id: 'KB_007',
    category: 'IPC',
    title: 'Criminal Breach of Trust — Section 405-409',
    description: 'When entrusted property or dominion is dishonestly misappropriated, it constitutes criminal breach of trust.',
    content: 'Whoever, being entrusted with property or with dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law or legal contract, commits criminal breach of trust.',
    bookmarked: false,
  },
  {
    id: 'KB_008',
    category: 'Contract Act',
    title: 'Penalty vs Liquidated Damages — Section 74',
    description: 'Section 74 of the Indian Contract Act treats penalty and liquidated damages similarly, allowing courts to award reasonable compensation.',
    content: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, the party complaining of the breach is entitled to receive reasonable compensation not exceeding the amount so named. The court has discretion to award any amount below the stipulated sum.',
    bookmarked: true,
  },
];

export const versionDiffData = {
  version1: {
    name: 'SaaS_Agreement_Draft_v1.pdf',
    date: '2026-06-15',
    clauses: 38,
    riskScore: 72,
  },
  version2: {
    name: 'SaaS_Agreement_Redline_v2.pdf',
    date: '2026-07-20',
    clauses: 42,
    riskScore: 84,
  },
  changes: [
    {
      id: 1,
      clause: '4.1',
      type: 'modified',
      label: 'Limitation of Liability',
      v1Text: 'Provider liability shall not exceed the total fees paid in the preceding 12 months.',
      v2Text: 'The Service Provider shall not be liable for any indirect, incidental, special, consequential, or punitive damages, regardless of cause of action.',
      riskChange: +20,
      severity: 'CRITICAL',
    },
    {
      id: 2,
      clause: '4.2',
      type: 'added',
      label: 'Indemnification',
      v1Text: null,
      v2Text: 'The Client shall indemnify, defend, and hold harmless the Service Provider from and against any and all claims, liabilities, damages...',
      riskChange: +78,
      severity: 'HIGH',
    },
    {
      id: 3,
      clause: '6.1',
      type: 'modified',
      label: 'Termination',
      v1Text: 'Either party may terminate with 30 days written notice.',
      v2Text: 'The Service Provider may terminate this Agreement at any time, for any reason, with immediate effect.',
      riskChange: +35,
      severity: 'CRITICAL',
    },
    {
      id: 4,
      clause: '7.3',
      type: 'added',
      label: 'Data Sharing',
      v1Text: null,
      v2Text: 'The Client acknowledges that the Service Provider may collect, process, and share the Client\'s data with third-party service providers.',
      riskChange: +68,
      severity: 'HIGH',
    },
    {
      id: 5,
      clause: '8.2',
      type: 'deleted',
      label: 'Mutual NDA',
      v1Text: 'Both parties agree to maintain confidentiality of all proprietary information exchanged during the term of this Agreement.',
      v2Text: null,
      riskChange: +15,
      severity: 'MEDIUM',
    },
    {
      id: 6,
      clause: '11.1',
      type: 'added',
      label: 'Non-Compete',
      v1Text: null,
      v2Text: 'The Client agrees not to engage in any business that competes with the Service Provider for two (2) years following termination.',
      riskChange: +90,
      severity: 'CRITICAL',
    },
  ],
  riskDifference: {
    overall: +12,
    critical: +3,
    high: +2,
    medium: -1,
    low: 0,
  },
};

export const processingSteps = [
  { id: 1, label: 'Uploading Document', status: 'complete', duration: '1.2s' },
  { id: 2, label: 'OCR Processing', status: 'complete', duration: '3.4s' },
  { id: 3, label: 'Extracting Clauses', status: 'complete', duration: '2.1s' },
  { id: 4, label: 'Classifying Clauses', status: 'active', duration: '—' },
  { id: 5, label: 'Contradiction Detection', status: 'pending', duration: '—' },
  { id: 6, label: 'Risk Analysis', status: 'pending', duration: '—' },
  { id: 7, label: 'Generating Report', status: 'pending', duration: '—' },
];

export const testimonials = [
  {
    id: 1,
    name: 'Adv. Priya Menon',
    role: 'Corporate Lawyer, Mumbai',
    quote: 'Machine Counsel caught a liability trap in a SaaS agreement that three junior associates missed. It paid for itself in the first week.',
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'Founder, TechVentures India',
    quote: 'We used to spend ₹25,000 per contract review. Now our first pass is automated and we only escalate the critical flags to our legal team.',
  },
  {
    id: 3,
    name: 'Sneha Iyer',
    role: 'Legal Head, FinEdge Solutions',
    quote: 'The contradiction detection is genuinely impressive. It found a governing law vs. jurisdiction mismatch that would have been a nightmare in litigation.',
  },
];

export const platformStats = [
  { label: 'Contracts Analyzed', value: '12,400+' },
  { label: 'Clauses Processed', value: '540K+' },
  { label: 'Risk Flags Raised', value: '38,200+' },
  { label: 'Avg. Processing Time', value: '8.2s' },
];

export const helpFaqs = [
  { q: 'How do I upload a contract?', a: 'Navigate to the Upload page from the sidebar. You can drag and drop PDF, DOCX, or image files into the upload zone. The system will automatically extract text and begin analysis.' },
  { q: 'What file formats are supported?', a: 'We support PDF, DOCX, and scanned images (JPG, PNG). Our OCR pipeline handles scanned documents, though digitally-native PDFs produce the most accurate results.' },
  { q: 'How is the risk score calculated?', a: 'The risk score is a weighted aggregate of individual clause risk assessments. Critical clauses (liability, termination, IP) carry higher weights. Scores above 70 indicate significant review needed.' },
  { q: 'Can I compare two versions of a contract?', a: 'Yes. Use the Compare Contracts page to upload two versions. The system performs semantic alignment to highlight additions, deletions, and modifications with associated risk changes.' },
  { q: 'Is my data secure?', a: 'All documents are encrypted at rest (AES-256) and in transit (TLS 1.3). We do not retain documents after analysis unless you explicitly save them. SOC 2 Type II certified.' },
  { q: 'How does the AI chat work?', a: 'The AI chat uses Retrieval-Augmented Generation (RAG) grounded strictly in your uploaded document. It will not hallucinate facts — all responses are backed by specific clause references.' },
];
