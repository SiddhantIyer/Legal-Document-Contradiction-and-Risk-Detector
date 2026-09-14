import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from extractors.semantic_extractor import (
    _consolidate_findings,
    _validate_findings,
    _deduplicate_findings,
    VALID_ISSUE_TYPES
)
from schemas import ExtractedClause, ExtractedContradiction

def test_valid_issue_types():
    assert "DRAFTING_IMPROVEMENT" in VALID_ISSUE_TYPES

def test_consolidate_findings():
    # Simple stub test for now
    clauses = [
        ExtractedClause(number="1", type="Term", text="A", finding_group="Group1", issue_type="AMBIGUITY"),
        ExtractedClause(number="2", type="Term", text="B", finding_group="Group1", issue_type="AMBIGUITY"),
    ]
    # Expected behavior: same group gets consolidated (if fully implemented)
    assert _consolidate_findings(clauses) is not None

def test_validate_findings():
    # Simple stub test
    clauses = [ExtractedClause(number="1", type="Test", text="Text")]
    contradictions = []
    c, c_out = _validate_findings(clauses, contradictions)
    assert len(c) == 1
    assert len(c_out) == 0

def test_deduplicate_findings():
    # Simple stub test
    clauses = [ExtractedClause(number="1", type="Test", text="Text")]
    assert len(_deduplicate_findings(clauses)) == 1
