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
from extractors.anomaly_detector import run_anomaly_detection

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

    # ── Step 4: Anomaly Detection (Isolation Forest) ─────────────
    if clauses:
        logger.info(f"  > Running anomaly detection on {len(clauses)} clauses...")
        clauses = run_anomaly_detection(clauses)

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


from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    question: str
    clauses: list = []
    contradictions: list = []
    summary: str = ""
    contract_name: str = ""

class RewriteRequest(BaseModel):
    original_text: str
    clause_type: str = "General"
    tone: str = "Balanced" # Conservative, Balanced, Market-standard
    risk_explanation: str = ""

class RewriteResponse(BaseModel):
    rewritten_text: str
    tone_used: str
    is_anomaly: bool
    anomaly_score: float

class ChatResponse(BaseModel):
    answer: str
    citations: list = []
    clause_refs: list = []

@app.post("/chat", response_model=ChatResponse)
async def chat_with_contract(req: ChatRequest):
    """
    AI-powered Q&A about a specific contract.
    Takes the user's question + contract context (clauses, contradictions, summary)
    and returns an intelligent answer using Groq LLM.
    """
    import os
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY", "")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    if not api_key or api_key == "your-groq-api-key-here":
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    # Build contract context from clauses
    clause_context = ""
    for i, clause in enumerate(req.clauses[:30]):  # Limit to 30 clauses for context window
        c_number = clause.get("number", str(i+1))
        c_type = clause.get("type", "")
        c_text = clause.get("text", clause.get("excerpt", ""))[:500]
        c_risk = clause.get("riskScore", 0)
        c_severity = clause.get("severity", "LOW")
        c_explanation = clause.get("explanation", "")[:200]
        clause_context += f"\n--- Clause {c_number} ({c_type}) [Risk: {c_risk}/100, Severity: {c_severity}] ---\n{c_text}\n"
        if c_explanation:
            clause_context += f"AI Analysis: {c_explanation}\n"

    contradiction_context = ""
    for contra in req.contradictions[:10]:
        clause_a = contra.get("clauseA", {}).get("number", "?")
        clause_b = contra.get("clauseB", {}).get("number", "?")
        classification = contra.get("classification", "")
        explanation = contra.get("explanation", "")[:300]
        contradiction_context += f"\n- Contradiction between Clause {clause_a} and Clause {clause_b} ({classification}): {explanation}\n"

    # Search RAG Knowledge Base
    from extractors.rag_retriever import rag_retriever
    rag_results = rag_retriever.search(req.question)
    
    rag_context = ""
    rag_citations = []
    for r in rag_results:
        rag_context += f"- {r['law']}, {r['section']} ({r['title']}): {r['text']}\n"
        rag_citations.append({"law": r['law'], "section": r['section']})

    system_prompt = f"""You are an expert legal AI assistant analyzing a contract titled "{req.contract_name}".
You have access to the full clause analysis, contradiction detection results, and relevant legal statutes retrieved from the knowledge base below.
Answer the user's questions accurately based ONLY on the contract data and the retrieved legal statutes.
Be specific — cite clause numbers, risk scores, and the provided legal statutes when applicable.
If the contract data doesn't contain enough information to answer, say so honestly.
Format your response with **bold** for key terms and use bullet points for lists.

RELEVANT LEGAL STATUTES (From Knowledge Base):
{rag_context if rag_context else "No relevant statutes found."}

CONTRACT SUMMARY:
{req.summary[:1000] if req.summary else "No summary available."}

ANALYZED CLAUSES:
{clause_context if clause_context else "No clauses available."}

CONTRADICTIONS DETECTED:
{contradiction_context if contradiction_context else "No contradictions detected."}"""

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.question},
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        answer = response.choices[0].message.content

        # Extract clause references mentioned in the answer (e.g. "Clause 4.1")
        import re
        clause_refs = list(set(re.findall(r'Clause\s+(\d+\.?\d*)', answer, re.IGNORECASE)))

        # Extract law citations (e.g. "Indian Contract Act 1872")
        law_patterns = re.findall(r'((?:Indian\s+)?(?:Contract|Consumer Protection|IT|Information Technology|Companies)\s+Act[^,\.\n]*(?:Section\s+[\d\-]+)?)', answer, re.IGNORECASE)
        citations = [{"law": law.strip()} for law in set(law_patterns)]
        
        # Combine regex citations with actual RAG citations retrieved
        all_citations = rag_citations + citations

        return ChatResponse(
            answer=answer,
            citations=all_citations[:5],
            clause_refs=clause_refs[:10],
        )
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")

@app.post("/rewrite", response_model=RewriteResponse)
async def rewrite_clause(req: RewriteRequest):
    """
    Clause Redliner / Suggestion Engine.
    Rewrites a clause based on the desired tone using few-shot templates,
    and runs it through the anomaly detector for validation.
    """
    import os
    import json
    from groq import Groq
    from extractors.anomaly_detector import detector

    api_key = os.getenv("GROQ_API_KEY", "")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    if not api_key or api_key == "your-groq-api-key-here":
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    # Load templates
    template_text = ""
    try:
        with open("data/clause_templates.json", "r", encoding="utf-8") as f:
            templates = json.load(f)
            # Try to find a matching template
            if req.clause_type in templates:
                type_templates = templates[req.clause_type]
                # Default to Balanced if exact tone not found
                template_text = type_templates.get(req.tone, type_templates.get("Balanced", ""))
    except Exception as e:
        logger.warning(f"Could not load clause templates: {e}")

    system_prompt = f"""You are an expert Indian corporate lawyer.
Your task is to rewrite a legal clause to be more {req.tone}.
Ensure the rewrite is legally sound, professional, and directly addresses any risks mentioned.
DO NOT include any commentary, explanations, or introductory text. Return ONLY the rewritten legal text."""

    if template_text:
        system_prompt += f"\n\nUse the following template as a structural and tonal guide for a {req.tone} clause:\nTEMPLATE:\n{template_text}"

    user_prompt = f"Original Clause:\n{req.original_text}\n"
    if req.risk_explanation:
        user_prompt += f"\nIdentified Risks to Fix:\n{req.risk_explanation}\n"
    user_prompt += f"\nPlease rewrite this clause to be {req.tone}."

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=1024,
        )
        rewritten_text = response.choices[0].message.content.strip()
        
        # Validation Pass: Anomaly Detection
        is_anomaly = False
        anomaly_score = 0.0
        
        if detector and detector.is_ready:
            try:
                embeddings = detector.encoder.encode([rewritten_text])
                predictions = detector.iso_forest.predict(embeddings)
                scores = detector.iso_forest.decision_function(embeddings)
                
                is_anomaly = bool(predictions[0] == -1)
                anomaly_score = float(scores[0])
            except Exception as e:
                logger.error(f"Validation anomaly detection failed: {e}")

        return RewriteResponse(
            rewritten_text=rewritten_text,
            tone_used=req.tone,
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score
        )
    except Exception as e:
        logger.error(f"Rewrite API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI rewrite failed: {str(e)}")


@app.get("/clause-library/templates")
async def get_templates():
    import json
    import os
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "clause_templates.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read templates: {e}")
        return {}

@app.post("/clause-library/templates")
async def save_templates(payload: dict):
    import json
    import os
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "clause_templates.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        return {"status": "success", "message": "Templates updated"}
    except Exception as e:
        logger.error(f"Failed to save templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to save templates")

@app.get("/clause-library/baseline")
async def get_baseline():
    import json
    import os
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "baseline_corpus.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read baseline: {e}")
        return []

@app.post("/clause-library/baseline")
async def save_baseline(payload: list):
    import json
    import os
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "baseline_corpus.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
            
        # Try to reload the anomaly detector so it picks up the new baseline
        from extractors.anomaly_detector import detector
        if detector:
            detector.is_ready = False
            detector._initialize_model()
            
        return {"status": "success", "message": "Baseline corpus updated"}
    except Exception as e:
        logger.error(f"Failed to save baseline: {e}")
        raise HTTPException(status_code=500, detail="Failed to save baseline")


@app.post("/export/docx")
async def export_to_docx(payload: dict):
    from docx import Document
    import io
    from fastapi.responses import StreamingResponse
    
    try:
        document = Document()
        document.add_heading(payload.get("contract_name", "Redlined Contract"), 0)
        
        for clause in payload.get("clauses", []):
            if clause.get("type"):
                document.add_heading(clause.get("type"), level=2)
            
            p = document.add_paragraph(clause.get("text", ""))
            
            # If the user accepted a rewrite, we can highlight it or something,
            # but the payload should just send the final text to use.
            
        file_stream = io.BytesIO()
        document.save(file_stream)
        file_stream.seek(0)
        
        return StreamingResponse(
            file_stream, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=redlined_contract.docx"}
        )
    except Exception as e:
        logger.error(f"Failed to export DOCX: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to export: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PYTHON_SERVICE_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

