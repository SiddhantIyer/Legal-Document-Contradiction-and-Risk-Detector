"""
Pydantic schemas for the contract extraction pipeline.
Defines the structured response format for all extracted data.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Document Metadata ───────────────────────────────────────────────

class ExtractedMetadata(BaseModel):
    """Metadata about the uploaded document itself."""
    filename: str = ""
    file_type: str = ""  # "pdf" or "docx"
    page_count: int = 0
    word_count: int = 0
    char_count: int = 0
    author: Optional[str] = None
    created_date: Optional[str] = None
    modified_date: Optional[str] = None


# ─── Regex-Extracted Entities ─────────────────────────────────────────

class ExtractedEntity(BaseModel):
    """A single entity extracted via regex or rule-based methods."""
    field_name: str  # e.g., "party_a", "effective_date", "governing_law"
    value: str
    source_text: str = ""  # The raw text snippet where this was found
    confidence: float = 1.0  # 1.0 for regex, lower for heuristic
    extraction_method: str = "regex"  # "regex" | "heuristic" | "llm"


# ─── Clause-Level Data ───────────────────────────────────────────────

class ClauseRef(BaseModel):
    """Reference to a clause used in contradiction detection."""
    number: str
    type: str = ""
    text: str = ""


class ExtractedClause(BaseModel):
    """A single clause extracted and analyzed from the contract."""
    number: str
    type: str
    text: str  # COMPLETE original clause text — never truncated for analysis
    excerpt: str = ""  # Shortened text for UI display (≤400 chars)
    heading: str = ""  # Original heading from the document (e.g., "Commercial Terms")
    finding_group: str = ""  # Groups related clauses under one finding topic
    summary: str = ""  # Legacy field — kept for backward compat (stores original_heading from old pipeline)
    clause_summary: str = ""  # Short description of what the clause actually says
    issue_type: str = ""  # CONTRACTUAL_RISK | LEGAL_COMPLIANCE | AMBIGUITY | MISSING_PROTECTION | NO_MATERIAL_ISSUE
    risk_score: int = 0
    severity: str = "LOW"  # CRITICAL | HIGH | MEDIUM | LOW
    confidence: int = 0  # 0 = not analyzed, 70-100 = analyzed confidence
    explanation: str = ""
    practical_impact: str = ""  # What could happen because of this issue
    recommendation: str = ""
    relevant_law: str = ""
    legal_citation_confidence: int = 0  # 0-100 confidence in the legal citation
    rewrite: str = ""
    analysis_status: str = "not_analyzed"  # "analyzed" | "not_analyzed" | "analysis_failed"
    source_section: str = ""  # Section/chunk ID for document traceability
    source_paragraph_index: int = -1  # Paragraph index within original document
    is_anomaly: bool = False
    anomaly_score: float = 0.0


# ─── Contradiction Data ──────────────────────────────────────────────

class ExtractedContradiction(BaseModel):
    """A detected contradiction between two clauses."""
    clause_a: ClauseRef
    clause_b: ClauseRef
    conflict_type: str = ""  # Legacy field, kept for backward compat
    classification: str = ""  # TRUE_CONTRADICTION | POTENTIAL_CONFLICT | AMBIGUITY | DUPLICATE_OBLIGATION | EXCEPTION | NO_CONFLICT
    severity: str = "MEDIUM"
    explanation: str = ""
    suggested_resolution: str = ""
    analysis_status: str = "analyzed"  # "analyzed" | "analysis_failed"


# ─── Full Extraction Response ────────────────────────────────────────

class ExtractionResponse(BaseModel):
    """Complete response from the extraction pipeline."""
    metadata: ExtractedMetadata = Field(default_factory=ExtractedMetadata)
    entities: list[ExtractedEntity] = Field(default_factory=list)
    clauses: list[ExtractedClause] = Field(default_factory=list)
    contradictions: list[ExtractedContradiction] = Field(default_factory=list)
    summary: str = ""
    contract_type: str = "General Agreement"
    overall_risk_score: int = 0
    overall_severity: str = "LOW"
    processing_time: str = ""
    confidence: int = 0  # 0 when not analyzed, rather than defaulting to 85
    input_completeness: str = "COMPLETE"  # "COMPLETE" | "INPUT_INCOMPLETE" | "UNKNOWN"
    extraction_diagnostics: dict = Field(default_factory=dict)  # char_count, word_count, chunks, etc.
    clause_analysis_status: str = "not_analyzed"  # "analyzed" | "not_analyzed" | "analysis_failed"
    contradiction_analysis_status: str = "not_analyzed"  # "analyzed" | "not_analyzed" | "analysis_failed"
