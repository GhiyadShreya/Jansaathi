"""
Post-checks on AI replies, run in code so they cost no extra AI tokens.

1. Unverified figures: every number in a reply must come from the verified scheme
   reference, the user's own message, or their profile. Percentages and rupee amounts are
   checked against the reference's percentages and amounts specifically, so "60%" is not
   accepted just because "60" appears as an age. Sentences with an unverified number are
   dropped, since a wrong amount is worse than a missing one.
2. Wrong script: replies in Hindi/Punjabi/Gujarati sometimes contain letters from another
   Indian script (e.g. Bengali letters inside a Gujarati word). Callers regenerate on that.
"""
import re
import unicodedata
from typing import Iterable

from app.services.scheme_reference import SCHEMES

# Native digit blocks -> ASCII (Devanagari, Gurmukhi, Gujarati)
_DIGITS = {}
for base in (0x0966, 0x0A66, 0x0AE6):
    for i in range(10):
        _DIGITS[chr(base + i)] = str(i)
_DIGIT_TABLE = str.maketrans(_DIGITS)

_NUM = r"\d+(?:[.,]\d+)*"
_MONEY_BEFORE = r"(?:₹|rs\.?|inr|रु\.?|रुपये)"
_MONEY_AFTER = (r"(?:lakh|lac|crore|thousand|लाख|करोड़|करोड|हज़ार|हजार|ਲੱਖ|ਲਖ|ਕਰੋੜ|ਹਜ਼ਾਰ|ਹਜਾਰ|"
                r"લાખ|કરોડ|હજાર|rupees|रुपये|रुपए|ਰੁਪਏ|રૂપિયા)")
_PERCENT_AFTER = r"(?:%|percent|प्रतिशत|फ़ीसदी|फीसदी|ਪ੍ਰਤੀਸ਼ਤ|ਫ਼ੀਸਦੀ|ਫੀਸਦੀ|ટકા)"

_SCRIPT_BLOCKS = {"hi": (0x0900, 0x097F), "pa": (0x0A00, 0x0A7F), "gu": (0x0A80, 0x0AFF)}
_DANDAS = {"।", "॥"}  # । ॥ are shared by several scripts


def _norm(n: str) -> str:
    n = n.replace(",", "").rstrip(".")
    if "." in n:
        n = n.rstrip("0").rstrip(".")
    return n.lstrip("0") or "0"


def _strip_noise(text: str) -> str:
    text = text.translate(_DIGIT_TABLE)
    text = re.sub(r"\]\([^)]*\)", "]", text)           # markdown link targets
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)  # bare URLs
    text = re.sub(r"\S+\.(?:gov|nic|org)\.in\S*", " ", text)  # domain names as link text
    text = re.sub(r"^\s*\d+[.)]\s+", "", text, flags=re.M)    # numbered-list markers
    return text


def _extract(text: str) -> tuple[set[str], set[str], set[str]]:
    """Returns (all numbers, money numbers, percent numbers) found in text."""
    t = _strip_noise(text).lower()
    every = {_norm(m) for m in re.findall(_NUM, t)}
    money = {_norm(m) for m in re.findall(_MONEY_BEFORE + r"\s*(" + _NUM + ")", t)}
    money |= {_norm(m) for m in re.findall("(" + _NUM + r")\s*" + _MONEY_AFTER, t)}
    pct = {_norm(m) for m in re.findall("(" + _NUM + r")\s*" + _PERCENT_AFTER, t)}
    return every, money, pct


_REF_TEXT = "\n".join(f"{name} {code} {facts}" for name, code, _h, facts, _u in SCHEMES)
_REF_ALL, _REF_MONEY, _REF_PCT = _extract(_REF_TEXT)
# Small counts ("3 instalments", "2 schemes") are fine unless used as money or percentages.
_SMALL = {str(i) for i in range(0, 11)}


def _key(s: str) -> str:
    # fold case and all hyphen/dash/space variants so "PM‑KISAN" matches "pm-kisan"
    return re.sub(r"[\s\-‐-―_]+", "", s).lower()


# Per-scheme figures, so an amount is only accepted for the scheme it belongs to.
_PER_SCHEME = []
for _name, _code, _hindi, _facts, _url in SCHEMES:
    _a, _m, _p = _extract(f"{_name} {_code} {_facts}")
    _PER_SCHEME.append(({_key(_name), _key(_code), _key(_hindi)}, _m, _p))


def _mentioned(text: str) -> list[tuple[set[str], set[str]]]:
    k = _key(text)
    return [(m, p) for keys, m, p in _PER_SCHEME if any(key and key in k for key in keys)]


class FigureChecker:
    def __init__(self, extra_sources: Iterable[str] = (), context: str = ""):
        """context: the whole reply. Money/percent figures are then limited to the schemes it
        mentions (falls back to the whole reference if it names none)."""
        extra_all: set[str] = set()
        for src in extra_sources:
            if src:
                extra_all |= _extract(str(src))[0]
        self.allowed_all = _REF_ALL | _SMALL | extra_all
        mentioned = _mentioned(context) if context else []
        if mentioned:
            self.allowed_money = set().union(*(m for m, _ in mentioned)) | extra_all
            self.allowed_pct = set().union(*(p for _, p in mentioned)) | extra_all
        else:
            self.allowed_money = _REF_MONEY | extra_all
            self.allowed_pct = _REF_PCT | extra_all

    def unverified(self, text: str) -> set[str]:
        every, money, pct = _extract(text)
        bad = {n for n in money if n not in self.allowed_money}
        bad |= {n for n in pct if n not in self.allowed_pct}
        bad |= {n for n in every - money - pct if n not in self.allowed_all}
        return bad

    def clean(self, text: str) -> tuple[str, list[str]]:
        """Drops sentences containing unverified figures. Returns (text, dropped sentences)."""
        dropped: list[str] = []
        out_lines = []
        for line in text.split("\n"):
            if not self.unverified(line):
                out_lines.append(line)
                continue
            prefix = re.match(r"^\s*(?:[-*+]|\d+[.)])\s+", line)
            body = line[prefix.end():] if prefix else line
            # keep a leading "**Scheme name** –" even if the sentence after it is dropped
            lead = re.match(r"^\*\*[^*]+\*\*\s*(?:\([^)]*\)\s*)?[–—:-]?\s*", body)
            if lead and not self.unverified(lead.group(0)):
                body = body[lead.end():]
            else:
                lead = None
            pieces = re.split(r"(?<=[.!?।])\s+", body)
            # re-join splits made after "Rs." so the amount stays with its sentence
            merged: list[str] = []
            for p in pieces:
                if merged and re.search(r"\b(?:rs|inr)\.$", merged[-1], re.I):
                    merged[-1] += " " + p
                else:
                    merged.append(p)
            kept = []
            for p in merged:
                (dropped if self.unverified(p) else kept).append(p)
            kept_text = " ".join(kept).strip()
            if lead:
                kept_text = (lead.group(0).rstrip(" –—:-") + (" – " + kept_text if kept_text else "")).strip()
            if kept_text and re.sub(r"[\s*_\-–—:|]", "", kept_text):
                out_lines.append((prefix.group(0) if prefix else "") + kept_text)
        cleaned = re.sub(r"\n{3,}", "\n\n", "\n".join(out_lines)).strip()
        return cleaned, dropped


def _is_foreign(ch: str, lo: int, hi: int) -> bool:
    """A letter/mark that is neither English nor the reply language's own script."""
    cp = ord(ch)
    if cp < 0x0250 or lo <= cp <= hi or ch in _DANDAS:  # Latin (incl. accents), own script
        return False
    return unicodedata.category(ch)[0] in ("L", "M")


def has_wrong_script(text: str, language: str) -> bool:
    block = _SCRIPT_BLOCKS.get(language)
    if not block:
        return False
    return any(_is_foreign(ch, *block) for ch in text)


def strip_wrong_script(text: str, language: str) -> str:
    """Last resort after a regenerate: delete stray letters from other scripts."""
    block = _SCRIPT_BLOCKS.get(language)
    if not block:
        return text
    return "".join(ch for ch in text if not _is_foreign(ch, *block))
