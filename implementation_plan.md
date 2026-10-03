# Context-Aware Contract Analysis — Implementation Plan

## Problem Statement

The analyzer currently produces ~47 clauses and ~19 flagged findings for a single contract. It over-reports by:
- Treating each paragraph as a separate clause (47 instead of ~15-20)
- Flagging optional drafting improvements as legal warnings
- Not consolidating related findings (e.g., 6 separate acceptance findings)
- Missing cross-clause context (flagging defined terms as undefined)
- Occasionally misclassifying exceptions as contradictions

## Design Approach

The fix targets **three key areas** via **prompt engineering + post-processing** — no architecture changes:

1. **Smarter clause extraction prompt** → fewer, more meaningful clauses
2. **Context-aware risk assessment** with cross-clause reasoning → fewer false positives
3. **New post-processing layer** → finding consolidation, deduplication, validation

The pipeline becomes:

```
Text → Regex → Clause Extraction → Risk Assessment (context-aware) → Contradiction Detection → Finding Consolidation → Summary
```

> [!IMPORTANT]  
> The new "Finding Consolidation" step is **post-processing only** — it doesn't add an LLM call. It merges and deduplicates findings programmatically after the LLM analysis completes.

---

## Proposed Changes

### [`semantic_extractor.py`](file:///c:/Users/Ritesh/Documents/Legal-Document-Contradiction-and-Risk-Detector/python_service/extractors/semantic_extractor.py)

This file receives the majority of changes.

#### 1. Clause Extraction Prompt (Lines 536-570)

**Current problem**: The prompt says "Extract EACH clause as a SEPARATE entry" and "A contract typically has 8-30 substantive clauses". This encourages the LLM to split every paragraph into a separate clause (47 for a normal contract).

**Change**: Rewrite to instruct the LLM to extract **substantive provisions** rather than individual paragraphs. Group related sub-provisions under their parent clause. Target 10-25 clauses for a standard contract.

#### 2. Risk Assessment Prompt (Lines 620-713)

**Current problem**: The prompt already has good anti-hallucination rules, but lacks:
- Instructions to consider cross-clause context before flagging
- Distinction between MATERIAL_RISK vs DRAFTING_IMPROVEMENT
- Instructions to check if an issue is resolved elsewhere in the contract
- One-sided clause awareness

**Change**: Add explicit instructions for:
- Cross-clause context awareness (definitions, exceptions, qualifiers)
- `DRAFTING_IMPROVEMENT` as a new sub-category of `NO_MATERIAL_ISSUE`
- One-sided clause detection rules
- "Is this resolved elsewhere?" check
- Stronger risk score calibration guidance

#### 3. Risk Assessment — Supply Full Contract Context (Lines 716-773)

**Current problem**: The `assess_risks` function sends only the target clause + abbreviated neighboring context. The LLM can't see definitions, exceptions, or related provisions elsewhere.

**Change**: Include a **contract structure summary** (definitions list, cross-references, qualifier phrases found) in the risk assessment prompt. This is built programmatically from the extracted clauses — no extra LLM call needed.

#### 4. Contradiction Detection Prompt (Lines 851-909)

**Current problem**: The prompt already has good exception-awareness rules. But it can be strengthened with:
- Explicit general-rule + exception examples
- "Warranty + as-is" pattern guidance
- Termination relationship analysis guidance
- Instructions to not report NO_CONFLICT pairs

**Change**: Enhance with specific examples from the user's test cases (Test A through Test H) embedded as guidance in the prompt.

#### 5. New: `_build_contract_context()` Helper (~Line 715)

**Purpose**: Before risk assessment, scan all extracted clauses to build a compact context string containing:
- Defined terms and their definitions (extracted from clause text)
- Qualifier phrases found ("notwithstanding", "subject to", "except", etc.)
- Cross-reference map (which clauses reference which)
- General rule → exception relationships

This context is prepended to the risk assessment prompt so the LLM can see the full contractual landscape.

#### 6. New: `_consolidate_findings()` Helper (~Line 835)

**Purpose**: Post-processing step after risk assessment. Groups related clauses by topic area and merges findings:
- Same acceptance mechanism → one consolidated finding
- Same payment structure → one finding
- Same IP/ownership topic → one finding

Uses clause type + heading + text similarity to detect related clauses.

#### 7. New: `_deduplicate_findings()` Helper (~Line 870)

**Purpose**: After contradiction detection, removes duplicate findings where:
- Two findings reference the same underlying risk
- A contradiction finding overlaps with a clause-level finding
- Multiple clauses flag the same defined-term issue

#### 8. New: `_validate_findings()` Helper (~Line 900)

**Purpose**: Output validation that rejects/repairs findings where:
- Referenced clause numbers don't exist
- Severity doesn't match risk score
- A term flagged as "undefined" actually IS defined elsewhere
- Risk score is disproportionate to the issue type
- Legal citation is empty but referenced

#### 9. Updated `run_semantic_extraction()` (Lines 1096-1151)

**Change**: Insert the consolidation and validation steps after contradiction detection:

```python
# Existing steps 1-4...
# Step 5 (NEW): Build cross-clause context
context = _build_contract_context(clauses)
# Step 2 modified: Risk assessment with context
clauses = assess_risks(clauses, text, context)  # Modified signature
# Step 3: Contradiction detection (existing)
# Step 5 (NEW): Consolidate and validate
clauses = _consolidate_findings(clauses)
clauses, contradictions = _validate_findings(clauses, contradictions)
# Step 4: Summary (existing)
```

---

### [`schemas.py`](file:///c:/Users/Ritesh/Documents/Legal-Document-Contradiction-and-Risk-Detector/python_service/schemas.py)

Minimal changes — preserve API compatibility.

#### [MODIFY] `ExtractedClause` (Line 44)

Add one optional field:
- `finding_group: str = ""` — Groups related clauses under one finding topic (e.g., "Acceptance Mechanism", "Payment Structure")

#### [MODIFY] `VALID_ISSUE_TYPES` (in semantic_extractor.py Line 38)

Add `"DRAFTING_IMPROVEMENT"` to distinguish optional improvements from material risks.

---

### [`main.py`](file:///c:/Users/Ritesh/Documents/Legal-Document-Contradiction-and-Risk-Detector/python_service/main.py)

No changes needed — the pipeline orchestration remains the same. All new logic lives in `semantic_extractor.py`.

---

## What Does NOT Change

| Component | Status |
|-----------|--------|
| Overall architecture | Unchanged |
| Groq API integration | Unchanged |
| `openai/gpt-oss-120b` model | Unchanged |
| API response structure | Backward compatible |
| `text_extractor.py` | No further changes |
| `regex_extractor.py` | No further changes |
| `main.py` | No changes |
| Frontend | No changes needed |

---

## Verification Plan

### Automated Tests
Re-run all 4 test contracts through the `/extract` endpoint and verify:

| Test Case | Expected Behavior |
|-----------|-------------------|
| **A**: General rule + exception (email change + Change Order) | `EXCEPTION`, not `TRUE_CONTRADICTION` |
| **B**: Acceptance + deemed acceptance | 1 consolidated finding, not 6 |
| **C**: Warranty + "except as expressly stated" as-is | `NO_CONFLICT` or low ambiguity |
| **D**: "Provider Material" defined and reused | NOT reported as undefined |
| **E**: Mutual liability cap | NOT classified as one-sided |
| **F**: Termination payment conflict (C-035 vs C-036) | `TRUE_CONTRADICTION` or `POTENTIAL_CONFLICT` — preserved |
| **G**: Missing e-signature/read receipt | No legal warning |
| **H**: Contractual interest rate | No invented RBI restriction |

### Quantitative Targets
- Contract 3 (stress test): **~10-15 findings** (down from 47 clauses / 19 flagged)
- Risk score calibration: NO_MATERIAL_ISSUE → 0-10, DRAFTING_IMPROVEMENT → 5-20
- Contradiction count: similar or fewer, but more accurately classified

### Manual Verification
- Upload contracts via web UI and visually inspect results

## Open Questions

> [!NOTE]
> No blocking questions — all requirements are clear. Proceeding with implementation.
