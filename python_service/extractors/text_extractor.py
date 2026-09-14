"""
Text Extractor — handles raw text extraction from PDF and DOCX files.

PDF:  Uses PyMuPDF (fitz) to extract text page-by-page with metadata.
DOCX: Uses python-docx to extract paragraphs, tables, and heading structure.

Improvements over original:
- DOCX tables are now extracted (payment schedules, milestones, SLAs, etc.)
- Heading detection beyond just Word styles (ARTICLE, SECTION, ALL-CAPS, numbered, title-style)
- Structured sections with metadata for section-aware chunking
- Extraction diagnostics logging
"""

import re
import logging
import fitz  # PyMuPDF
from docx import Document as DocxDocument
from io import BytesIO
from schemas import ExtractedMetadata

logger = logging.getLogger(__name__)

# ─── Heading Detection ──────────────────────────────────────────────

# Patterns that indicate a line is a heading (applied to stripped lines)
_NUMBERED_HEADING_RE = re.compile(
    r'^(\d+\.(?:\d+\.?)*)\s+[A-Z]',  # "1.1 Definitions"
)
_ARTICLE_HEADING_RE = re.compile(
    r'^(ARTICLE|Article)\s+[IVXLC\d]+',  # "ARTICLE IV" or "Article 4"
)
_SECTION_HEADING_RE = re.compile(
    r'^(SECTION|Section|SCHEDULE|Schedule|ANNEX|Annex|EXHIBIT|Exhibit|APPENDIX|Appendix)\s+[\dA-Z]',
)
_COMMON_CONTRACT_HEADINGS = {
    # Core contract sections
    "definitions", "term and termination", "termination", "payment terms",
    "confidentiality", "indemnification", "limitation of liability",
    "intellectual property", "governing law", "dispute resolution",
    "force majeure", "warranties", "representations and warranties",
    "scope of work", "deliverables", "acceptance", "notices",
    "assignment", "amendment", "severability", "entire agreement",
    "non-compete", "non-solicitation", "data privacy", "data protection",
    "insurance", "compliance", "audit", "subcontracting",
    "change control", "service levels", "fees and compensation",
    "obligations", "responsibilities", "ownership", "license",
    "commercial terms", "general terms", "special terms",
    "recitals", "preamble", "background", "whereas",
    # Payment and financial
    "fees and payment", "payment", "pricing", "charges",
    "compensation", "invoicing", "expenses",
    # People and access
    "personnel", "people, access and information",
    "people, approvals and communications",
    "client responsibilities", "customer responsibilities",
    # Delivery and acceptance
    "deliveries and review", "delivery", "delivery, testing and acceptance",
    "testing", "project schedule", "milestones",
    "dates and dependency risk",
    # IP and ownership
    "ownership, tools and third-party material",
    "ownership, licence and third-party material",
    "ownership and licensing",
    # Confidentiality and data
    "confidential information", "confidentiality and security",
    "personal data and security", "data processing",
    "security", "privacy",
    # Warranties and liability
    "warranty", "warranty and remedies", "representations",
    "promises and disclaimers", "disclaimers",
    "claims and protection", "liability", "indemnity",
    # Termination and duration
    "suspension and termination", "duration",
    "duration and ending the relationship",
    "term", "ending the relationship",
    # Dispute and general
    "disagreements", "arbitration",
    "assignment and subcontracting",
    "general", "miscellaneous", "boilerplate",
    "boilerplate that looks harmless",
    # Scope and purpose
    "purpose", "purpose and context", "purpose and scope",
    "how changes are supposed to work",
    "what cloudharbor will do",  # Will be matched case-insensitively
    # Parties
    "parties",
}


def _is_heading_line(line: str, has_heading_style: bool = False) -> bool:
    """
    Determine if a line is likely a section heading.
    
    Uses multiple heuristics:
    - Word heading styles (from DOCX)
    - Numbered patterns (1.1, 2.3.1)
    - ARTICLE / SECTION / SCHEDULE patterns
    - ALL-CAPS short lines
    - Common contract heading keywords
    - Short title-style lines (capitalized, no trailing period)
    
    Guards against false positives:
    - Lines > 80 chars are not headings (they're paragraphs)
    - Lines < 3 chars are not headings
    - Lines ending with period/comma are likely sentences, not headings
    """
    if has_heading_style:
        return True
    
    stripped = line.strip()
    
    # Too short or too long
    if len(stripped) < 3 or len(stripped) > 80:
        return False
    
    # Lines ending with sentence punctuation are unlikely headings
    if stripped.endswith(('.', ',', ';', ':')):
        # Exception: "SCHEDULE A:" is still a heading
        if not _SECTION_HEADING_RE.match(stripped.rstrip(':. ')):
            return False
    
    # Numbered heading: "1.1 Definitions", "2.3 Payment Terms"
    if _NUMBERED_HEADING_RE.match(stripped):
        return True
    
    # ARTICLE / SECTION / SCHEDULE patterns
    if _ARTICLE_HEADING_RE.match(stripped):
        return True
    if _SECTION_HEADING_RE.match(stripped):
        return True
    
    # ALL-CAPS line (at least 3 chars, not just numbers/symbols)
    alpha_chars = [c for c in stripped if c.isalpha()]
    if len(alpha_chars) >= 3 and all(c.isupper() for c in alpha_chars):
        # Exclude lines that are just "AND", "OR", "THE" etc.
        if len(stripped.split()) >= 2 or stripped.lower() in _COMMON_CONTRACT_HEADINGS:
            return True
    
    # Common contract heading keywords (case-insensitive exact match)
    if stripped.lower() in _COMMON_CONTRACT_HEADINGS:
        return True
    
    # Title-case short line with no trailing punctuation (e.g., "Commercial Terms")
    words = stripped.split()
    if 2 <= len(words) <= 6 and stripped[0].isupper():
        # Most words should be capitalized (allowing small words like "and", "of", "the")
        small_words = {"a", "an", "and", "as", "at", "by", "for", "in", "is", "of", "on", "or", "the", "to", "with"}
        cap_count = sum(1 for w in words if w[0].isupper() or w.lower() in small_words)
        if cap_count == len(words):
            return True
    
    # Sentence-case short line: first word capitalized, 2-6 words, no trailing
    # punctuation — common in modern informal contracts
    # (e.g., "Deliveries and review", "Claims and protection")
    if 2 <= len(words) <= 6 and stripped[0].isupper():
        # Guard: must NOT look like a normal sentence (no articles starting, 
        # no verb-like patterns). Short lines with first-cap and all-lowercase
        # remaining words that don't end in sentence punctuation are likely headings.
        first_word_lower = words[0].lower()
        # Skip if first word is a common sentence-starting word but not a heading word
        sentence_starters = {"the", "a", "an", "it", "this", "that", "these", "those",
                            "we", "he", "she", "they", "i", "you", "our", "my", "his", "her",
                            "its", "their", "your", "any", "all", "each", "every",
                            "if", "when", "where", "while", "although", "unless",
                            "because", "since", "after", "before", "until",
                            "however", "therefore", "moreover", "furthermore",
                            "no", "not", "neither", "nor", "but",
                            "provided", "except", "notwithstanding", "subject"}
        if first_word_lower not in sentence_starters:
            # Check it's genuinely short and heading-like
            if len(stripped) <= 50:
                return True
    
    return False


# ─── Table Extraction ────────────────────────────────────────────────

def _extract_table_text(table) -> str:
    """
    Convert a python-docx table to a readable text representation.
    
    Output format:
    [TABLE]
    Header1 | Header2 | Header3
    val1 | val2 | val3
    val4 | val5 | val6
    """
    rows = []
    for row in table.rows:
        cells = []
        for cell in row.cells:
            cell_text = cell.text.strip().replace('\n', ' ').replace('|', '/')
            cells.append(cell_text)
        rows.append(" | ".join(cells))
    
    if not rows:
        return ""
    
    return "[TABLE]\n" + "\n".join(rows)


# ─── Structured Section ─────────────────────────────────────────────

def _make_section(heading: str, text: str, section_type: str, index: int) -> dict:
    """Create a structured section dict."""
    return {
        "heading": heading,
        "text": text,
        "type": section_type,  # "paragraph" | "table" | "heading"
        "index": index,
    }


# ─── PDF Extraction ─────────────────────────────────────────────────

def extract_from_pdf(file_bytes: bytes, filename: str) -> tuple[str, list[dict], ExtractedMetadata]:
    """
    Extract text from a PDF file.
    
    Returns:
        (full_text, structured_sections, metadata)
        - full_text: entire document as one string
        - structured_sections: list of section dicts with heading/text/type/index
        - metadata: document metadata
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    pages: list[str] = []
    for page in doc:
        text = page.get_text("text")
        pages.append(text)

    full_text = "\n\n".join(pages)
    
    # Build structured sections from PDF text using heading detection
    sections: list[dict] = []
    current_heading = ""
    current_lines: list[str] = []
    section_idx = 0
    
    for line in full_text.split('\n'):
        stripped = line.strip()
        if not stripped:
            if current_lines:
                current_lines.append("")  # Preserve paragraph breaks
            continue
        
        if _is_heading_line(stripped):
            # Save previous section
            if current_lines:
                section_text = "\n".join(current_lines).strip()
                if section_text:
                    sections.append(_make_section(current_heading, section_text, "paragraph", section_idx))
                    section_idx += 1
                current_lines = []
            current_heading = stripped
        else:
            current_lines.append(stripped)
    
    # Don't forget the last section
    if current_lines:
        section_text = "\n".join(current_lines).strip()
        if section_text:
            sections.append(_make_section(current_heading, section_text, "paragraph", section_idx))
    
    # If no sections were detected, create one big section
    if not sections and full_text.strip():
        sections = [_make_section("", full_text.strip(), "paragraph", 0)]

    # Extract PDF metadata
    pdf_meta = doc.metadata or {}
    metadata = ExtractedMetadata(
        filename=filename,
        file_type="pdf",
        page_count=len(doc),
        word_count=len(full_text.split()),
        char_count=len(full_text),
        author=pdf_meta.get("author") or None,
        created_date=pdf_meta.get("creationDate") or None,
        modified_date=pdf_meta.get("modDate") or None,
    )

    doc.close()
    
    # Diagnostics logging
    table_count = sum(1 for s in sections if s["type"] == "table")
    logger.info(
        "TEXT_DIAGNOSTICS file=%s chars=%d words=%d sections=%d tables=%d first_100=%.100s last_100=%.100s",
        filename, len(full_text), len(full_text.split()), len(sections), table_count,
        repr(full_text[:100]), repr(full_text[-100:]) if len(full_text) >= 100 else repr(full_text),
    )
    
    return full_text, sections, metadata


# ─── DOCX Extraction ────────────────────────────────────────────────

def extract_from_docx(file_bytes: bytes, filename: str) -> tuple[str, list[dict], ExtractedMetadata]:
    """
    Extract text from a DOCX file.
    
    Handles:
    - Paragraphs with heading detection (Word styles + heuristic)
    - Tables (payment schedules, milestones, SLAs, etc.)
    - Document-order interleaving of paragraphs and tables
    
    Returns:
        (full_text, structured_sections, metadata)
        - full_text: entire document as one string
        - structured_sections: list of section dicts with heading/text/type/index
        - metadata: document metadata
    """
    doc = DocxDocument(BytesIO(file_bytes))

    # We need to iterate the document body in order to properly interleave
    # paragraphs and tables. python-docx exposes doc.element.body which
    # contains both <w:p> (paragraphs) and <w:tbl> (tables) in document order.
    
    sections: list[dict] = []
    current_heading = ""
    current_section_lines: list[str] = []
    section_idx = 0
    table_count = 0
    
    # Build lookup maps for paragraph and table objects by their XML elements
    para_map = {}
    for para in doc.paragraphs:
        para_map[id(para._element)] = para
    
    table_map = {}
    for table in doc.tables:
        table_map[id(table._element)] = table
    
    # Iterate body elements in document order
    for child in doc.element.body:
        tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
        
        if tag == 'p':
            # Paragraph element
            para = para_map.get(id(child))
            if para is None:
                continue
            
            text = para.text.strip()
            if not text:
                continue
            
            # Check if this is a heading
            has_heading_style = (
                para.style 
                and para.style.name 
                and para.style.name.startswith("Heading")
            )
            
            if _is_heading_line(text, has_heading_style):
                # Save previous section
                if current_section_lines:
                    section_text = "\n".join(current_section_lines)
                    sections.append(_make_section(current_heading, section_text, "paragraph", section_idx))
                    section_idx += 1
                    current_section_lines = []
                current_heading = text
            else:
                current_section_lines.append(text)
                
        elif tag == 'tbl':
            # Table element — save current paragraph section first
            if current_section_lines:
                section_text = "\n".join(current_section_lines)
                sections.append(_make_section(current_heading, section_text, "paragraph", section_idx))
                section_idx += 1
                current_section_lines = []
            
            table = table_map.get(id(child))
            if table is None:
                continue
                
            table_text = _extract_table_text(table)
            if table_text:
                table_count += 1
                sections.append(_make_section(
                    current_heading,
                    table_text,
                    "table",
                    section_idx,
                ))
                section_idx += 1

    # Don't forget the last section
    if current_section_lines:
        sections.append(_make_section(current_heading, "\n".join(current_section_lines), "paragraph", section_idx))

    # Build full text from all sections (preserving order and structure)
    full_text_parts = []
    for section in sections:
        if section["heading"] and section["type"] != "table":
            full_text_parts.append(section["heading"])
        full_text_parts.append(section["text"])
    
    full_text = "\n\n".join(full_text_parts)
    
    # If no sections were detected, create one big section
    if not sections and full_text.strip():
        sections = [_make_section("", full_text.strip(), "paragraph", 0)]

    # Extract DOCX core properties
    core_props = doc.core_properties
    metadata = ExtractedMetadata(
        filename=filename,
        file_type="docx",
        page_count=0,  # DOCX doesn't have a reliable page count without rendering
        word_count=len(full_text.split()),
        char_count=len(full_text),
        author=core_props.author or None,
        created_date=str(core_props.created) if core_props.created else None,
        modified_date=str(core_props.modified) if core_props.modified else None,
    )
    
    # Diagnostics logging
    logger.info(
        "TEXT_DIAGNOSTICS file=%s chars=%d words=%d sections=%d tables=%d first_100=%.100s last_100=%.100s",
        filename, len(full_text), len(full_text.split()), len(sections), table_count,
        repr(full_text[:100]), repr(full_text[-100:]) if len(full_text) >= 100 else repr(full_text),
    )

    return full_text, sections, metadata


# ─── Main Entry Point ────────────────────────────────────────────────

def extract_text(file_bytes: bytes, filename: str) -> tuple[str, list[dict], ExtractedMetadata]:
    """
    Route to the correct extractor based on file extension.
    
    Returns:
        (full_text, structured_sections, metadata)
        - full_text: complete document text as one string
        - structured_sections: list of section dicts [{heading, text, type, index}, ...]
        - metadata: document metadata
    """
    lower_name = filename.lower()

    if lower_name.endswith(".pdf"):
        return extract_from_pdf(file_bytes, filename)
    elif lower_name.endswith(".docx"):
        return extract_from_docx(file_bytes, filename)
    else:
        raise ValueError(f"Unsupported file type: {filename}. Only PDF and DOCX are supported.")
