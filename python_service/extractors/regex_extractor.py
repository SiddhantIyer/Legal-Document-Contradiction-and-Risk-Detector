"""
Regex Extractor — rule-based entity extraction from contract text.

Extracts structured entities like parties, dates, monetary values,
jurisdiction, notice periods, etc. using regex patterns and heuristics.

Improvements over original:
- Entity deduplication by (field_name, normalized_value)
- Confidence differentiated by extraction method (exact regex vs heuristic)
- Governing law / court jurisdiction / arbitration seat distinguished
- Unnumbered heading patterns (ALL-CAPS, title-style)
- Source text preserved without excessive truncation
"""

import re
from schemas import ExtractedEntity


# ─── Pattern Definitions ─────────────────────────────────────────────

# Party names — "between X and Y", "by and between", "hereinafter"
PARTY_PATTERNS = [
    # "between [Party A] and [Party B]"
    r'(?:between|by and between)\s+["\']?([A-Z][A-Za-z\s&.,]+?)(?:["\']?\s*\(.*?\))?\s+(?:and|&)\s+["\']?([A-Z][A-Za-z\s&.,]+?)(?:["\']?\s*\(.*?\))?(?:\s*[,.]|\s+hereinafter)',
    # "hereinafter referred to as"
    r'["\']([A-Z][A-Za-z\s&.,]+?)["\']?\s*(?:\(|,)?\s*hereinafter\s+(?:referred\s+to\s+as|called)\s+["\']?(\w+)',
]

# Effective date
DATE_PATTERNS = [
    r'(?:effective\s+(?:as\s+of|from|date)|dated\s+(?:this|as\s+of)|entered\s+into\s+(?:as\s+of|on)|made\s+(?:on|this))\s+[:\s]*(\d{1,2}[\s/\-\.]+\w+[\s/\-\.]+\d{2,4})',
    r'(?:effective\s+(?:as\s+of|from|date)|dated\s+(?:this|as\s+of))\s+[:\s]*(\w+\s+\d{1,2},?\s+\d{4})',
    r'(?:effective\s+date|commencement\s+date)\s*(?::|is|shall\s+be)\s*(\d{1,2}[\s/\-\.]+\w+[\s/\-\.]+\d{2,4})',
    r'(?:effective\s+date|commencement\s+date)\s*(?::|is|shall\s+be)\s*(\w+\s+\d{1,2},?\s+\d{4})',
]

# Expiration / term duration
TERM_PATTERNS = [
    r'(?:term|duration|period)\s+(?:of|shall\s+be)\s+(\d+)\s*(years?|months?|days?)',
    r'(?:expires?|expiration|valid\s+until|terminate)\s+(?:on|at|as\s+of)\s+(\d{1,2}[\s/\-\.]+\w+[\s/\-\.]+\d{2,4})',
    r'(?:expires?|expiration|valid\s+until)\s+(?:on|at|as\s+of)\s+(\w+\s+\d{1,2},?\s+\d{4})',
    r'for\s+(?:a\s+)?(?:period\s+of\s+)?(\d+)\s*(years?|months?|days?)\s+(?:from|commencing|beginning)',
]

# Governing law — separated into three distinct categories
GOVERNING_LAW_PATTERNS = [
    r'(?:governed\s+by|subject\s+to|construed\s+in\s+accordance\s+with)\s+(?:the\s+)?(?:laws?\s+of\s+)?(?:the\s+)?(?:State\s+of\s+)?([A-Z][A-Za-z\s,]+?)(?:\.|,|\s+and\b)',
]

COURT_JURISDICTION_PATTERNS = [
    r'(?:jurisdiction\s+of)\s+(?:the\s+)?(?:courts?\s+(?:of|in|at)\s+)?([A-Z][A-Za-z\s,]+?)(?:\.|,)',
    r'(?:courts?\s+(?:of|in|at))\s+([A-Z][A-Za-z\s,]+?)\s+(?:shall\s+have|will\s+have)\s+(?:exclusive\s+)?jurisdiction',
    r'(?:exclusive\s+jurisdiction)\s+(?:of\s+)?(?:the\s+)?(?:courts?\s+(?:of|in|at)\s+)?([A-Z][A-Za-z\s,]+?)(?:\.|,)',
]

ARBITRATION_PATTERNS = [
    r'(?:arbitration\s+in|arbitrated\s+in|seat\s+of\s+arbitration)\s+([A-Z][A-Za-z\s,]+?)(?:\.|,)',
    r'(?:venue\s+of\s+arbitration)\s+(?:shall\s+be\s+)?([A-Z][A-Za-z\s,]+?)(?:\.|,)',
    r'(?:arbitration)\s+(?:shall\s+be\s+)?(?:conducted\s+)?(?:in|at)\s+([A-Z][A-Za-z\s,]+?)(?:\.|,)',
]

# Monetary values
MONEY_PATTERNS = [
    # Currency symbol + amount: $1,000,000 or ₹50,00,000 or USD 1,000
    r'((?:USD|INR|EUR|GBP|Rs\.?|₹|\$|€|£)\s*[\d,]+(?:\.\d{1,2})?)',
    # Written amounts: "sum of fifty thousand" etc.
    r'(?:sum\s+of|amount\s+of|not\s+exceed(?:ing)?|aggregate\s+(?:of|liability))\s+((?:USD|INR|EUR|GBP|Rs\.?|₹|\$|€|£)\s*[\d,]+(?:\.\d{1,2})?)',
]

# Notice period
NOTICE_PATTERNS = [
    r'(\d+)\s*(?:calendar\s+|business\s+|working\s+)?(days?|months?|weeks?)[\'\']*\s*(?:prior\s+)?(?:written\s+)?notice',
    r'notice\s+period\s+of\s+(\d+)\s*(days?|months?|weeks?)',
    r'(\d+)\s*(?:calendar\s+|business\s+|working\s+)?(days?|months?|weeks?)\s+(?:advance\s+)?notice',
]

# Confidentiality survival
CONFIDENTIALITY_PATTERNS = [
    r'confidential(?:ity)?\s+(?:obligations?\s+)?(?:shall\s+)?survive\s+(?:for\s+)?(?:a\s+period\s+of\s+)?(\d+)\s*(years?|months?)',
    r'(?:survive|surviving)\s+(?:the\s+)?(?:termination|expiration)\s+(?:of\s+this\s+agreement\s+)?(?:for\s+)?(?:a\s+period\s+of\s+)?(\d+)\s*(years?|months?)',
]

# Penalty / liquidated damages / interest rate
PENALTY_PATTERNS = [
    r'(?:penalty|liquidated\s+damages?)\s+(?:of|in\s+the\s+amount\s+of)\s+((?:USD|INR|EUR|GBP|Rs\.?|₹|\$|€|£)\s*[\d,]+(?:\.\d{1,2})?)',
    r'(?:interest|late\s+(?:payment\s+)?(?:fee|charge|penalty))\s+(?:at\s+)?(?:the\s+rate\s+of\s+)?(\d+(?:\.\d+)?)\s*%\s*(?:per\s+)?(month|annum|year|day)',
    r'(\d+(?:\.\d+)?)\s*%\s*(?:per\s+)?(month|annum|year)\s+(?:interest|penalty|late\s+fee)',
]

# Section headings (for structural extraction)
HEADING_PATTERNS = [
    r'^(\d+\.(?:\d+\.?)*)\s+([A-Z][A-Za-z\s]+)',  # "1.1 Definitions"
    r'^(ARTICLE\s+[IVXLC]+)\s*[:\.\-]\s*(.+)',  # "ARTICLE IV: Termination"
    r'^(Section\s+\d+(?:\.\d+)?)\s*[:\.\-]\s*(.+)',  # "Section 2.1: Payment"
    r'^(SCHEDULE\s+[A-Z\d]+)\s*[:\.\-]?\s*(.*)',  # "SCHEDULE A: ..."
    # Unnumbered headings — ALL CAPS (at least 2 words, ≤80 chars)
    r'^([A-Z][A-Z\s]{4,78})$',
]

# Definitions — "Term" means, shall mean
DEFINITION_PATTERNS = [
    r'["\u201c]([A-Z][A-Za-z\s]+?)["\u201d]\s+(?:shall\s+)?mean(?:s)?\s+(.+?)(?:\.|;)',
    r'["\u201c]([A-Z][A-Za-z\s]+?)["\u201d]\s+(?:refers?\s+to|is\s+defined\s+as)\s+(.+?)(?:\.|;)',
]

# Contract type keywords for heuristic classification
CONTRACT_TYPE_KEYWORDS = {
    "Software Development / Services": [
        "software development", "service provider", "deliverables",
        "milestone", "source code", "deployment", "development agreement",
        "services agreement", "implementation", "acceptance",
        "project schedule", "technical design", "user acceptance",
        "api", "database", "web application", "platform",
    ],
    "Non-Disclosure (NDA)": [
        "non-disclosure", "nda", "disclosing party",
        "proprietary information", "mutual non-disclosure",
        "unilateral non-disclosure",
    ],
    "Employment Contract": [
        "employment", "employee", "employer", "salary", "compensation",
        "probation", "termination of employment", "working hours",
    ],
    "SaaS Agreement": [
        "saas", "software as a service", "subscription",
        "service level", "uptime", "sla",
    ],
    "Vendor / Supply": [
        "vendor", "supplier", "purchase order", "supply", "delivery",
        "goods", "procurement", "shipment",
    ],
    "Lease / Rental": [
        "lease", "rental", "tenant", "landlord", "premises",
        "rent", "occupancy",
    ],
    "Freelancer Services": [
        "freelancer", "consultant", "independent contractor",
        "statement of work", "sow",
    ],
    "Co-Founder Terms": [
        "co-founder", "founder", "equity", "vesting", "shares",
        "partnership", "startup", "incorporation",
    ],
    "Merger / Acquisition": [
        "merger", "acquisition", "takeover", "due diligence",
        "share purchase", "asset purchase",
    ],
    "Loan Agreement": [
        "loan", "borrower", "lender", "principal", "interest rate",
        "repayment", "collateral", "mortgage",
    ],
    "Construction / Works": [
        "contractor", "tender", "construction", "civil works",
        "bill of quantities", "site", "tenderer",
        "corrigendum", "notice inviting tender",
    ],
}


# ─── Extraction Functions ────────────────────────────────────────────

def _find_all(pattern: str, text: str, flags: int = re.IGNORECASE | re.MULTILINE) -> list[re.Match]:
    """Find all matches of a pattern in text."""
    return list(re.finditer(pattern, text, flags))


def extract_parties(text: str) -> list[ExtractedEntity]:
    """Extract party names from the contract."""
    entities = []
    for pattern in PARTY_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            groups = match.groups()
            for i, name in enumerate(groups):
                if name and len(name.strip()) > 2:
                    clean_name = name.strip().rstrip(",. ")
                    # Skip if it's a common word rather than a party name
                    if clean_name.lower() in ("and", "the", "this", "that", "with"):
                        continue
                    field = f"party_{'a' if i == 0 else 'b'}"
                    entities.append(ExtractedEntity(
                        field_name=field,
                        value=clean_name,
                        source_text=match.group(0)[:300],
                        confidence=0.85,  # Heuristic: party name detection is pattern-based
                        extraction_method="regex",
                    ))
    return entities


def extract_dates(text: str) -> list[ExtractedEntity]:
    """Extract effective date and expiration from the contract."""
    entities = []

    for pattern in DATE_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            entities.append(ExtractedEntity(
                field_name="effective_date",
                value=match.group(1).strip(),
                source_text=match.group(0)[:300],
                confidence=0.95,  # Strong regex match
                extraction_method="regex",
            ))
            break  # Take only the first match for effective date
        if entities:
            break

    for pattern in TERM_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            groups = match.groups()
            if len(groups) >= 2:
                value = f"{groups[0]} {groups[1]}"
            else:
                value = groups[0]
            entities.append(ExtractedEntity(
                field_name="contract_term",
                value=value.strip(),
                source_text=match.group(0)[:300],
                confidence=0.95,
                extraction_method="regex",
            ))
            break
        if len(entities) > 1:
            break

    return entities


# Blocklist for governing law — generic terms that are not actual jurisdictions
_GOVERNING_LAW_BLOCKLIST = {
    "applicable law", "the law", "law", "applicable laws",
    "their applicable licences", "their applicable licenses",
    "applicable licence", "applicable license",
    "its applicable licences", "its applicable licenses",
    "the applicable law", "the applicable laws",
}


def extract_jurisdiction(text: str) -> list[ExtractedEntity]:
    """Extract governing law, court jurisdiction, and arbitration seat as separate entities."""
    entities = []
    
    # Governing law
    for pattern in GOVERNING_LAW_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            value = match.group(1).strip().rstrip(",. ")
            # Filter out generic terms that aren't actual jurisdictions
            if value.lower() in _GOVERNING_LAW_BLOCKLIST:
                continue
            if 2 < len(value) < 100:
                entities.append(ExtractedEntity(
                    field_name="governing_law",
                    value=value,
                    source_text=match.group(0)[:300],
                    confidence=0.90,  # Strong pattern match, but context-dependent
                    extraction_method="regex",
                ))
                break
        if any(e.field_name == "governing_law" for e in entities):
            break
    
    # Court jurisdiction
    for pattern in COURT_JURISDICTION_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            value = match.group(1).strip().rstrip(",. ")
            if 2 < len(value) < 100:
                entities.append(ExtractedEntity(
                    field_name="court_jurisdiction",
                    value=value,
                    source_text=match.group(0)[:300],
                    confidence=0.90,
                    extraction_method="regex",
                ))
                break
        if any(e.field_name == "court_jurisdiction" for e in entities):
            break
    
    # Arbitration seat/venue
    for pattern in ARBITRATION_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            value = match.group(1).strip().rstrip(",. ")
            if 2 < len(value) < 100:
                entities.append(ExtractedEntity(
                    field_name="arbitration_seat",
                    value=value,
                    source_text=match.group(0)[:300],
                    confidence=0.90,
                    extraction_method="regex",
                ))
                break
        if any(e.field_name == "arbitration_seat" for e in entities):
            break
    
    return entities


def extract_monetary_values(text: str) -> list[ExtractedEntity]:
    """Extract monetary values, fees, and amounts."""
    entities = []
    seen_values = set()

    for pattern in MONEY_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            value = match.group(1).strip().rstrip(",. ")
            # Filter out tiny/garbage matches like "rs," or single currency symbols
            # A valid monetary value must have at least one digit
            if not any(c.isdigit() for c in value):
                continue
            # Skip values that are just a currency prefix with no meaningful amount
            digits_only = "".join(c for c in value if c.isdigit())
            if len(digits_only) < 2:
                continue
            if value not in seen_values:
                seen_values.add(value)
                entities.append(ExtractedEntity(
                    field_name="monetary_value",
                    value=value,
                    source_text=match.group(0)[:300],
                    confidence=0.95,
                    extraction_method="regex",
                ))

    return entities


def extract_notice_period(text: str) -> list[ExtractedEntity]:
    """Extract notice period requirements."""
    entities = []
    for pattern in NOTICE_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            groups = match.groups()
            value = f"{groups[0]} {groups[1]}"
            entities.append(ExtractedEntity(
                field_name="notice_period",
                value=value.strip(),
                source_text=match.group(0)[:300],
                confidence=0.95,
                extraction_method="regex",
            ))
            break
        if entities:
            break
    return entities


def extract_confidentiality_duration(text: str) -> list[ExtractedEntity]:
    """Extract confidentiality survival period."""
    entities = []
    for pattern in CONFIDENTIALITY_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            groups = match.groups()
            value = f"{groups[0]} {groups[1]}"
            entities.append(ExtractedEntity(
                field_name="confidentiality_duration",
                value=value.strip(),
                source_text=match.group(0)[:300],
                confidence=0.95,
                extraction_method="regex",
            ))
            break
        if entities:
            break
    return entities


def extract_penalties(text: str) -> list[ExtractedEntity]:
    """Extract penalty amounts and interest rates."""
    entities = []
    for pattern in PENALTY_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            groups = match.groups()
            if len(groups) >= 2:
                value = f"{groups[0]}{'% per ' + groups[1] if not groups[0].startswith(('$', '₹', 'R', 'U', 'I', 'E', 'G', '€', '£')) else ''}"
            else:
                value = groups[0]
            entities.append(ExtractedEntity(
                field_name="penalty",
                value=value.strip(),
                source_text=match.group(0)[:300],
                confidence=0.95,
                extraction_method="regex",
            ))
    return entities


def extract_section_headings(text: str) -> list[dict]:
    """
    Extract section/clause headings for structural analysis.
    Returns list of dicts: { number, title, position }
    """
    headings = []
    seen = set()

    for pattern in HEADING_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            number = match.group(1).strip()
            title = match.group(2).strip() if match.lastindex >= 2 else ""
            key = f"{number}:{title}"
            if key not in seen:
                seen.add(key)
                headings.append({
                    "number": number,
                    "title": title,
                    "position": match.start(),
                })

    # Sort by position in document
    headings.sort(key=lambda h: h["position"])
    return headings


def extract_definitions(text: str) -> list[ExtractedEntity]:
    """Extract defined terms from the contract."""
    entities = []
    seen_terms = set()

    for pattern in DEFINITION_PATTERNS:
        matches = _find_all(pattern, text)
        for match in matches:
            term = match.group(1).strip()
            definition = match.group(2).strip()
            if term.lower() not in seen_terms and len(term) > 1:
                seen_terms.add(term.lower())
                entities.append(ExtractedEntity(
                    field_name="definition",
                    value=f"{term}: {definition[:200]}",
                    source_text=match.group(0)[:300],
                    confidence=0.95,
                    extraction_method="regex",
                ))

    return entities


def detect_contract_type(text: str) -> tuple[str, float]:
    """
    Detect contract type using keyword frequency analysis.
    Returns (contract_type, confidence).
    
    Confidence philosophy:
    - Strong keyword match → 0.60–0.85
    - No matches → 0.50 (default to "General Agreement")
    """
    lower_text = text.lower()
    scores: dict[str, int] = {}

    for contract_type, keywords in CONTRACT_TYPE_KEYWORDS.items():
        score = 0
        for keyword in keywords:
            count = lower_text.count(keyword)
            score += count
        if score > 0:
            scores[contract_type] = score

    if not scores:
        return "General Agreement", 0.50

    best_type = max(scores, key=scores.get)
    # Confidence based on how dominant the top type is
    total = sum(scores.values())
    confidence = min(scores[best_type] / max(total, 1), 1.0)
    # Keyword classification confidence range: 0.60–0.85
    confidence = round(0.60 + confidence * 0.25, 2)

    return best_type, confidence


def _deduplicate_entities(entities: list[ExtractedEntity]) -> list[ExtractedEntity]:
    """
    Deduplicate entities by (field_name, normalized_value).
    Keeps the entity with the highest confidence.
    """
    seen: dict[str, ExtractedEntity] = {}
    
    for entity in entities:
        # Normalize: lowercase, strip whitespace, collapse spaces
        norm_value = " ".join(entity.value.lower().split())
        key = f"{entity.field_name}::{norm_value}"
        
        if key not in seen or entity.confidence > seen[key].confidence:
            seen[key] = entity
    
    return list(seen.values())


# ─── Main Regex Extraction Entrypoint ────────────────────────────────

def run_regex_extraction(text: str) -> tuple[list[ExtractedEntity], list[dict], str, float]:
    """
    Run all regex-based extractions on the contract text.
    
    Returns:
        (entities, headings, contract_type, type_confidence)
    """
    entities: list[ExtractedEntity] = []

    entities.extend(extract_parties(text))
    entities.extend(extract_dates(text))
    entities.extend(extract_jurisdiction(text))
    entities.extend(extract_monetary_values(text))
    entities.extend(extract_notice_period(text))
    entities.extend(extract_confidentiality_duration(text))
    entities.extend(extract_penalties(text))
    entities.extend(extract_definitions(text))
    
    # Deduplicate entities
    entities = _deduplicate_entities(entities)

    headings = extract_section_headings(text)
    contract_type, type_confidence = detect_contract_type(text)

    return entities, headings, contract_type, type_confidence
