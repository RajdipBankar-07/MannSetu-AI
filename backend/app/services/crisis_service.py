"""
Crisis Detection Service for MannSetu AI

Runs a fast keyword + pattern check on every user message BEFORE the AI reply
is generated. This is a non-negotiable safety layer — it never delays or
replaces the AI response, but ensures crisis resources are always surfaced.
"""

import re
import logging
from typing import Tuple

logger = logging.getLogger("mannsetu.crisis")

# India-specific crisis resources (always shown together)
CRISIS_RESOURCES = {
    "tele_manas": {"name": "Tele-MANAS", "number": "14416", "alt_number": "1-800-891-4416"},
    "icall": {"name": "iCall (TISS)", "number": "9152987821"},
    "vandrevala": {"name": "Vandrevala Foundation", "number": "1860-2662-345"},
    "aasra": {"name": "AASRA", "number": "9820466627"},
}

CRISIS_RESOURCES_TEXT = (
    "🆘 **Crisis Support Resources (India):**\n"
    "• **Tele-MANAS** (Govt. of India): **14416** or 1-800-891-4416 (24/7, Free)\n"
    "• **iCall (TISS Mumbai)**: **9152987821** (Mon–Sat, 8am–10pm)\n"
    "• **Vandrevala Foundation**: **1860-2662-345** (24/7)\n"
    "• **AASRA**: **9820466627** (24/7)\n\n"
    "_Please reach out to a trusted adult or professional. You don't have to face this alone._ 💙"
)

# ─── Keyword Lists ────────────────────────────────────────────────────────────

# High-severity: direct self-harm / suicide expressions
HIGH_SEVERITY_KEYWORDS = [
    # English
    r"\bsuicid\w*\b",
    r"\bkill\s+myself\b", r"\bkilling\s+myself\b", r"\bkill\s+me\b",
    r"\bend\s+my\s+life\b", r"\bending\s+my\s+life\b",
    r"\bwant\s+to\s+die\b", r"\bwanting\s+to\s+die\b",
    r"\bself[\s\-]harm\b", r"\bself[\s\-]hurt\b",
    r"\bcut\s+myself\b", r"\bcutting\s+myself\b",
    r"\bhurt\s+myself\b", r"\bhurting\s+myself\b",
    r"\bnot\s+worth\s+living\b",
    r"\bno\s+reason\s+to\s+live\b", r"\bno\s+will\s+to\s+live\b",
    r"\bdon'?t\s+want\s+to\s+be\s+alive\b",
    r"\bdon'?t\s+want\s+to\s+exist\b",
    r"\bwish\s+I\s+was\s+dead\b", r"\bwish\s+I\s+were\s+dead\b",
    r"\btake\s+my\s+own\s+life\b",
    r"\boverdose\b",
    r"\bhanging\s+myself\b",
    r"\bjump\s+off\b",
    # Hindi / Hinglish transliterations
    r"\bmar\s+jao?na\b", r"\bmar\s+jana\b", r"\bkhatam\s+karna\b",
    r"\bkhatam\s+ho\s+jana\b", r"\bzindagi\s+khatam\b",
    r"\bkhud\s+ko\s+marna\b", r"\bkhud\s+khatam\b",
    r"\bjina\s+nahi\b", r"\bjee\s+nahi\b",
    r"\bzinda\s+nahi\s+rehna\b",
    r"\bbohot\s+takleef\b",
]

# Medium-severity: distress signals that warrant a compassionate check-in
MEDIUM_SEVERITY_KEYWORDS = [
    r"\bno\s+one\s+cares\b", r"\bnobody\s+cares\b",
    r"\bfeel\s+hopeless\b", r"\bfeeling\s+hopeless\b",
    r"\bcompletely\s+alone\b", r"\bentirely\s+alone\b",
    r"\bcan'?t\s+go\s+on\b", r"\bcannot\s+go\s+on\b",
    r"\bgive\s+up\b",
    r"\bno\s+hope\b", r"\bno\s+future\b",
    r"\bcan'?t\s+take\s+it\s+anymore\b",
    r"\bbreaking\s+down\b",
    r"\bfall\s+apart\b",
    r"\bfeel\s+empty\b", r"\bfeeling\s+empty\b",
    r"\bnumb\s+inside\b",
    r"\bdon'?t\s+want\s+to\s+wake\s+up\b",
    # Hinglish
    r"\bkoi\s+nahi\s+hai\b",
    r"\bkoi\s+umeed\s+nahi\b",
    r"\bsab\s+khatam\b",
    r"\bhar\s+gaya\b", r"\bhaar\s+gaya\b",
]

# Compiled patterns for performance
_HIGH_PATTERNS = [re.compile(p, re.IGNORECASE) for p in HIGH_SEVERITY_KEYWORDS]
_MEDIUM_PATTERNS = [re.compile(p, re.IGNORECASE) for p in MEDIUM_SEVERITY_KEYWORDS]


def detect_crisis(text: str) -> Tuple[bool, str, str]:
    """
    Checks user message for crisis signals.

    Returns:
        (crisis_detected: bool, severity: str, matched_pattern: str)
        severity is one of: "high", "medium", "none"
    """
    if not text or not text.strip():
        return False, "none", ""

    text_clean = text.strip()

    # Check high-severity first
    for pattern in _HIGH_PATTERNS:
        match = pattern.search(text_clean)
        if match:
            logger.warning(
                f"[CRISIS DETECTED] HIGH severity. Pattern: '{pattern.pattern}'. "
                f"Matched: '{match.group()}'"
            )
            return True, "high", match.group()

    # Check medium-severity
    for pattern in _MEDIUM_PATTERNS:
        match = pattern.search(text_clean)
        if match:
            logger.warning(
                f"[CRISIS DETECTED] MEDIUM severity. Pattern: '{pattern.pattern}'. "
                f"Matched: '{match.group()}'"
            )
            return True, "medium", match.group()

    return False, "none", ""


def get_crisis_resources_text() -> str:
    """Returns the formatted crisis resources string for display in the UI."""
    return CRISIS_RESOURCES_TEXT


def get_crisis_resources_dict() -> dict:
    """Returns the structured crisis resources dictionary."""
    return CRISIS_RESOURCES
