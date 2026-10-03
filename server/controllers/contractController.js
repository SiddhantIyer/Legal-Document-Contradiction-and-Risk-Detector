const Contract = require('../models/Contract');
const FormData = require('form-data');

// Python extraction service URL
const EXTRACTION_SERVICE_URL = process.env.EXTRACTION_SERVICE_URL || 'http://localhost:8000';

// @desc    Get all contracts for the logged-in user
// @route   GET /api/contracts
// @access  Private
const getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ userId: req.user._id })
      .select('-clauseData -contradictionData -entities') // Exclude heavy analysis data from list view
      .sort({ createdAt: -1 });

    res.json({ contracts });
  } catch (error) {
    console.error('getContracts error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get a single contract by ID (with full analysis data)
// @route   GET /api/contracts/:id
// @access  Private
const getContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.json({ contract });
  } catch (error) {
    console.error('getContract error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Create a new contract (manual / legacy)
// @route   POST /api/contracts
// @access  Private
const createContract = async (req, res) => {
  try {
    const {
      name,
      type,
      clauseData,
      contradictionData,
      riskScore,
      clauses,
      contradictions,
      severity,
      processingTime,
      confidence,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Contract name is required' });
    }

    const contract = await Contract.create({
      userId: req.user._id,
      name,
      type: type || 'General',
      clauseData: clauseData || [],
      contradictionData: contradictionData || [],
      riskScore: riskScore ?? null,
      clauses: clauses ?? null,
      contradictions: contradictions ?? null,
      severity: severity || null,
      processingTime: processingTime || null,
      confidence: confidence ?? null,
      status: status || 'Analyzed',
      uploadDate: new Date().toISOString().split('T')[0],
    });

    // Return the contract without heavy analysis data for the list update
    const { clauseData: _, contradictionData: __, ...contractSummary } = contract.toObject();

    res.status(201).json({ contract: contractSummary });
  } catch (error) {
    console.error('createContract error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Upload a contract file and analyze it via Python extraction service
// @route   POST /api/contracts/upload
// @access  Private
const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;

    console.log(`📄 Uploading: ${originalname} (${(buffer.length / 1024).toFixed(1)}KB) → ${EXTRACTION_SERVICE_URL}/extract`);

    // Forward the file to the Python extraction service
    const form = new FormData();
    form.append('file', buffer, {
      filename: originalname,
      contentType: mimetype,
    });

    let extractionResponse;
    try {
      // Convert form-data stream to buffer for compatibility with native fetch
      const formBuffer = form.getBuffer();
      const formHeaders = form.getHeaders();

      const fetchResponse = await fetch(`${EXTRACTION_SERVICE_URL}/extract`, {
        method: 'POST',
        body: formBuffer,
        headers: formHeaders,
      });

      if (!fetchResponse.ok) {
        const errorBody = await fetchResponse.json().catch(() => ({}));
        const errorMessage = errorBody.detail || `Extraction service returned ${fetchResponse.status}`;
        console.error(`❌ Extraction service error: ${fetchResponse.status} — ${errorMessage}`);
        return res.status(fetchResponse.status >= 500 ? 502 : fetchResponse.status).json({
          message: errorMessage,
        });
      }

      extractionResponse = await fetchResponse.json();
      console.log(`✅ Extraction complete: ${extractionResponse.clauses?.length || 0} clauses, ${extractionResponse.contradictions?.length || 0} contradictions`);
    } catch (fetchError) {
      console.error('Extraction service call failed:', fetchError.message);
      return res.status(502).json({
        message: 'Cannot reach the extraction service. Make sure the Python service is running on port 8000.',
      });
    }

    // Map the extraction response to our Contract model
    const {
      metadata = {},
      entities = [],
      clauses: extractedClauses = [],
      contradictions: extractedContradictions = [],
      summary = '',
      contract_type = 'General Agreement',
      overall_risk_score = 0,
      overall_severity = 'LOW',
      processing_time = '',
      confidence = 0,
      input_completeness = 'UNKNOWN',
      extraction_diagnostics = {},
      clause_analysis_status = 'not_analyzed',
      contradiction_analysis_status = 'not_analyzed',
    } = extractionResponse;

    // Map clauses from Python format to Mongoose schema format
    const clauseData = extractedClauses.map((c) => ({
      number: c.number || '?',
      type: c.type || 'General',
      text: c.text || '',
      excerpt: c.excerpt || (c.text || '').substring(0, 400),
      heading: c.heading || '',
      clauseSummary: c.clause_summary || '',
      issueType: c.issue_type || '',
      riskScore: c.risk_score ?? 0,
      severity: c.severity || 'LOW',
      confidence: c.confidence ?? 0,
      explanation: c.explanation || '',
      practicalImpact: c.practical_impact || '',
      recommendation: c.recommendation || '',
      relevantLaw: c.relevant_law || '',
      legalCitationConfidence: c.legal_citation_confidence ?? 0,
      rewrite: c.rewrite || '',
      analysisStatus: c.analysis_status || 'not_analyzed',
      sourceSection: c.source_section || '',
    }));

    // Map contradictions from Python format to Mongoose schema format
    const contradictionData = extractedContradictions.map((c) => ({
      clauseA: {
        number: c.clause_a?.number || '',
        type: c.clause_a?.type || '',
        text: c.clause_a?.text || '',
      },
      clauseB: {
        number: c.clause_b?.number || '',
        type: c.clause_b?.type || '',
        text: c.clause_b?.text || '',
      },
      conflictType: c.conflict_type || c.classification || '',
      classification: c.classification || c.conflict_type || '',
      severity: c.severity || 'MEDIUM',
      explanation: c.explanation || '',
      suggestedResolution: c.suggested_resolution || '',
      analysisStatus: c.analysis_status || 'analyzed',
    }));

    // Create the contract in MongoDB
    const contract = await Contract.create({
      userId: req.user._id,
      name: originalname,
      type: contract_type,
      clauseData,
      contradictionData,
      riskScore: overall_risk_score,
      clauses: clauseData.length,
      contradictions: contradictionData.length,
      severity: overall_severity,
      processingTime: processing_time,
      confidence,
      status: 'Analyzed',
      uploadDate: new Date().toISOString().split('T')[0],
      documentMetadata: {
        filename: metadata.filename || originalname,
        file_type: metadata.file_type || '',
        page_count: metadata.page_count || 0,
        word_count: metadata.word_count || 0,
        char_count: metadata.char_count || 0,
        author: metadata.author || null,
        created_date: metadata.created_date || null,
        modified_date: metadata.modified_date || null,
      },
      entities: entities.map((e) => ({
        field_name: e.field_name || '',
        value: e.value || '',
        source_text: e.source_text || '',
        confidence: e.confidence ?? 1.0,
        extraction_method: e.extraction_method || 'regex',
      })),
      summary,
      inputCompleteness: input_completeness,
      clauseAnalysisStatus: clause_analysis_status,
      contradictionAnalysisStatus: contradiction_analysis_status,
      extractionDiagnostics: extraction_diagnostics,
    });

    // Return the contract summary (without heavy embedded arrays) for list update
    const contractObj = contract.toObject();
    const {
      clauseData: _cd,
      contradictionData: _ctd,
      entities: _ent,
      ...contractSummaryObj
    } = contractObj;

    res.status(201).json({ contract: contractSummaryObj });
  } catch (error) {
    console.error('uploadAndAnalyze error:', error.message);
    res.status(500).json({ message: 'Server error during contract analysis. Please try again.' });
  }
};

// @desc    Delete a contract
// @route   DELETE /api/contracts/:id
// @access  Private
const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('deleteContract error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    AI Chat — ask questions about a specific contract
// @route   POST /api/contracts/:id/chat
// @access  Private
const chatWithContract = async (req, res) => {
  try {
    const contract = await Contract.findOne({ _id: req.params.id, userId: req.user._id });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Forward to Python service with contract context
    const response = await fetch(`${EXTRACTION_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.trim(),
        clauses: contract.clauseData || [],
        contradictions: contract.contradictionData || [],
        summary: contract.summary || '',
        contract_name: contract.name || '',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Python service returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('chatWithContract error:', error.message);
    res.status(500).json({ message: error.message || 'AI chat failed' });
  }
};



module.exports = { getContracts, getContract, createContract, uploadAndAnalyze, deleteContract, chatWithContract };

