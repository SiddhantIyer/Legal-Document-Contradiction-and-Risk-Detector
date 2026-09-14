"""
FastAPI application for contract data & metadata extraction.

Endpoints:
  POST /extract  — Upload a PDF/DOCX file, returns all extracted data
  GET  /health   — Health check
"""

import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import ExtractionResponse, ExtractedMetadata
from extractors.text_extractor import extract_text
from extractors.regex_extractor import run_regex_extraction
from extractors.semantic_extractor import run_semantic_extraction

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("extraction-service")

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
# Max file size: 20MB
MAX_FILE_SIZE = 20 * 1024 * 1024


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown events."""
    logger.info("🚀 Contract Extraction Service starting up...")
    yield
    logger.info("🛑 Contract Extraction Service shutting down...")


app = FastAPI(
    title="Contract Extraction Service",
    description="Extracts structured data and metadata from legal contracts (PDF/DOCX)",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow the Node.js server to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "contract-extraction", "version": "2.0.0"}


@app.post("/extract", response_model=ExtractionResponse)
async def extract_contract(file: UploadFile = File(...)):
    """
    Upload a contract file (PDF or DOCX) and extract all structured data.
    
    The pipeline:
    1. Text extraction (PyMuPDF / python-docx) — with tables and heading detection
    2. Regex/rule-based entity extraction (parties, dates, amounts, etc.)
    3. LLM semantic extraction via Groq (clauses, risks, contradictions, summary)
    4. Validation layer (risk↔severity consistency, classification validation)
    
    Returns a comprehensive ExtractionResponse with all extracted data.
    """
    start_time = time.time()

    # ── Validate file ────────────────────────────────────────────
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    extension = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}. Only PDF and DOCX are supported.",
        )

    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(file_bytes) / 1024 / 1024:.1f}MB). Maximum is 20MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    logger.info(f"📄 Processing: {file.filename} ({len(file_bytes) / 1024:.1f}KB)")

    # ── Step 1: Text Extraction ──────────────────────────────────
    try:
        full_text, sections, metadata = extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    if not full_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from the document. It may be a scanned image — only digitally-native PDFs and DOCX are supported.",
        )

    # Build extraction diagnostics
    table_count = sum(1 for s in sections if s.get("type") == "table")
    extraction_diagnostics = {
        "filename": file.filename,
        "file_size_bytes": len(file_bytes),
        "char_count": len(full_text),
        "word_count": len(full_text.split()),
        "section_count": len(sections),
        "table_count": table_count,
    }

    logger.info(f"  ✓ Text extracted: {metadata.word_count} words, {metadata.page_count} pages, {len(sections)} sections, {table_count} tables")

    # ── Step 2: Regex/Rule-based Extraction ──────────────────────
    try:
        entities, headings, contract_type, type_confidence = run_regex_extraction(full_text)
        logger.info(f"  ✓ Regex extraction: {len(entities)} entities, {len(headings)} headings, type={contract_type}")
    except Exception as e:
        logger.error(f"Regex extraction failed: {e}")
        entities, headings, contract_type, type_confidence = [], [], "General Agreement", 0.5

    # ── Step 3: Semantic Extraction (Groq LLM) ───────────────────
    clause_analysis_status = "not_analyzed"
    contradiction_analysis_status = "not_analyzed"
    input_completeness = "UNKNOWN"
    
    try:
        clauses, contradictions, summary_data, input_completeness, clause_analysis_status, contradiction_analysis_status = run_semantic_extraction(
            full_text, sections
        )
        logger.info(f"  ✓ Semantic extraction: {len(clauses)} clauses, {len(contradictions)} contradictions")
        logger.info(f"  ✓ Input completeness: {input_completeness}")
    except ValueError as e:
        # Groq API key not set — return what we have from regex
        logger.warning(f"Semantic extraction skipped: {e}")
        clauses, contradictions, summary_data = [], [], {"summary": "Semantic extraction unavailable — Groq API key not configured."}
    except Exception as e:
        logger.error(f"Semantic extraction failed: {e}")
        clauses, contradictions, summary_data = [], [], {"summary": f"Semantic extraction failed: {str(e)}"}
        clause_analysis_status = "analysis_failed"
        contradiction_analysis_status = "analysis_failed"

    # Add chunk count to diagnostics
    extraction_diagnostics["clause_count"] = len(clauses)
    extraction_diagnostics["contradiction_count"] = len(contradictions)

    # ── Compute aggregate metrics ────────────────────────────────
    processing_time = time.time() - start_time

    # Only compute metrics from successfully analyzed clauses
    analyzed_clauses = [c for c in clauses if c.analysis_status == "analyzed"]
    
    if analyzed_clauses:
        # Weight critical/high clauses more
        weights = {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 1, "LOW": 0.5}
        total_weight = sum(weights.get(c.severity, 1) for c in analyzed_clauses)
        weighted_sum = sum(c.risk_score * weights.get(c.severity, 1) for c in analyzed_clauses)
        overall_risk = round(weighted_sum / max(total_weight, 1))

        severity_order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}
        max_severity = max(analyzed_clauses, key=lambda c: severity_order.get(c.severity, 0))
        overall_severity = max_severity.severity

        avg_confidence = round(sum(c.confidence for c in analyzed_clauses) / len(analyzed_clauses))
    elif clauses:
        # Clauses were extracted but none were successfully analyzed
        overall_risk = 0
        overall_severity = "LOW"
        avg_confidence = 0  # Not 85 — that would imply successful analysis
    else:
        overall_risk = 0
        overall_severity = "LOW"
        avg_confidence = 0

    # ── Build response ───────────────────────────────────────────
    response = ExtractionResponse(
        metadata=metadata,
        entities=entities,
        clauses=clauses,
        contradictions=contradictions,
        summary=summary_data.get("summary", ""),
        contract_type=contract_type,
        overall_risk_score=overall_risk,
        overall_severity=overall_severity,
        processing_time=f"{processing_time:.1f}s",
        confidence=avg_confidence,
        input_completeness=input_completeness,
        extraction_diagnostics=extraction_diagnostics,
        clause_analysis_status=clause_analysis_status,
        contradiction_analysis_status=contradiction_analysis_status,
    )

    logger.info(f"  ✅ Done in {processing_time:.1f}s — risk={overall_risk}, severity={overall_severity}, completeness={input_completeness}")
    return response


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PYTHON_SERVICE_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
