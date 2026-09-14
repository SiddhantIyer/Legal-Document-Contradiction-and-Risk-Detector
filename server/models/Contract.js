const mongoose = require('mongoose');

const clauseSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, required: true },
    text: { type: String, required: true },
    excerpt: { type: String, default: '' }, // Shortened text for UI display (≤400 chars)
    heading: { type: String, default: '' }, // Original heading from document
    clauseSummary: { type: String, default: '' },
    issueType: { type: String, default: '' }, // CONTRACTUAL_RISK | LEGAL_COMPLIANCE | AMBIGUITY | MISSING_PROTECTION | NO_MATERIAL_ISSUE
    riskScore: { type: Number, default: 0 },
    severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'LOW' },
    confidence: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    practicalImpact: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    relevantLaw: { type: String, default: '' },
    legalCitationConfidence: { type: Number, default: 0 },
    rewrite: { type: String, default: '' },
    analysisStatus: { type: String, default: 'not_analyzed' }, // analyzed | not_analyzed | analysis_failed
    sourceSection: { type: String, default: '' }, // Section/chunk ID for traceability
  },
  { _id: true }
);

const contradictionClauseRefSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  { _id: false }
);

const contradictionSchema = new mongoose.Schema(
  {
    clauseA: { type: contradictionClauseRefSchema, required: true },
    clauseB: { type: contradictionClauseRefSchema, required: true },
    conflictType: { type: String, default: '' }, // Legacy field
    classification: { type: String, default: '' }, // TRUE_CONTRADICTION | POTENTIAL_CONFLICT | AMBIGUITY | DUPLICATE_OBLIGATION | EXCEPTION | NO_CONFLICT
    severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    explanation: { type: String, default: '' },
    suggestedResolution: { type: String, default: '' },
    analysisStatus: { type: String, default: 'analyzed' }, // analyzed | analysis_failed
  },
  { _id: true }
);

const documentMetadataSchema = new mongoose.Schema(
  {
    filename: { type: String, default: '' },
    file_type: { type: String, default: '' },
    page_count: { type: Number, default: 0 },
    word_count: { type: Number, default: 0 },
    char_count: { type: Number, default: 0 },
    author: { type: String, default: null },
    created_date: { type: String, default: null },
    modified_date: { type: String, default: null },
  },
  { _id: false }
);

const extractedEntitySchema = new mongoose.Schema(
  {
    field_name: { type: String, required: true },
    value: { type: String, required: true },
    source_text: { type: String, default: '' },
    confidence: { type: Number, default: 1.0 },
    extraction_method: { type: String, default: 'regex' },
  },
  { _id: false }
);

const contractSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contract name is required'],
      trim: true,
    },
    type: {
      type: String,
      default: 'General',
      trim: true,
    },
    uploadDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    status: {
      type: String,
      enum: ['Analyzed', 'Processing', 'Failed'],
      default: 'Analyzed',
    },
    riskScore: { type: Number, default: null },
    clauses: { type: Number, default: null }, // clause count
    contradictions: { type: Number, default: null }, // contradiction count
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', null],
      default: null,
    },
    processingTime: { type: String, default: null },
    confidence: { type: Number, default: null },

    // Embedded analysis data
    clauseData: [clauseSchema],
    contradictionData: [contradictionSchema],

    // Document metadata from extraction
    documentMetadata: { type: documentMetadataSchema, default: () => ({}) },

    // Regex-extracted entities (parties, dates, amounts, etc.)
    entities: [extractedEntitySchema],

    // AI-generated summary
    summary: { type: String, default: '' },

    // Pipeline status fields
    inputCompleteness: { type: String, default: 'COMPLETE' }, // COMPLETE | INPUT_INCOMPLETE | UNKNOWN
    clauseAnalysisStatus: { type: String, default: 'not_analyzed' }, // analyzed | not_analyzed | analysis_failed
    contradictionAnalysisStatus: { type: String, default: 'not_analyzed' }, // analyzed | not_analyzed | analysis_failed
    extractionDiagnostics: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contract', contractSchema);
