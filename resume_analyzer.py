from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Iterable


SKILL_ALIASES = {
    "python": ("python",),
    "java": ("java",),
    "javascript": ("javascript", "java script", "js"),
    "typescript": ("typescript", "type script", "ts"),
    "react": ("react", "reactjs", "react js", "react.js"),
    "node": ("node", "nodejs", "node js", "node.js"),
    "django": ("django",),
    "flask": ("flask",),
    "fastapi": ("fastapi", "fast api"),
    "sql": ("sql",),
    "mysql": ("mysql", "my sql"),
    "postgresql": ("postgresql", "postgres"),
    "mongodb": ("mongodb", "mongo db"),
    "aws": ("aws", "amazon web services"),
    "azure": ("azure",),
    "gcp": ("gcp", "google cloud"),
    "docker": ("docker",),
    "kubernetes": ("kubernetes", "k8s"),
    "git": ("git", "github", "git hub"),
    "linux": ("linux",),
    "machine learning": ("machine learning", "ml"),
    "deep learning": ("deep learning",),
    "nlp": ("nlp", "natural language processing"),
    "data analysis": ("data analysis", "data analytics", "analytics"),
    "pandas": ("pandas",),
    "numpy": ("numpy",),
    "tensorflow": ("tensorflow", "tensor flow"),
    "pytorch": ("pytorch", "py torch"),
    "excel": ("excel", "microsoft excel"),
    "power bi": ("power bi", "powerbi"),
    "tableau": ("tableau",),
    "communication": ("communication", "communications", "presentation", "presentations"),
    "leadership": ("leadership",),
    "problem solving": ("problem solving", "problem-solving"),
    "project management": ("project management",),
    "agile": ("agile",),
    "scrum": ("scrum",),
}

SKILL_KEYWORDS = set(SKILL_ALIASES)

SECTION_KEYWORDS = {
    "experience": ("experience", "employment", "work history", "internship"),
    "education": ("education", "degree", "university", "college"),
    "skills": ("skills", "technical skills", "tools", "technologies"),
    "projects": ("projects", "portfolio", "case study"),
    "certifications": ("certification", "certifications", "license"),
}


@dataclass(frozen=True)
class AnalysisResult:
    score: int
    matched_skills: list[str]
    missing_skills: list[str]
    resume_keywords: list[str]
    job_keywords: list[str]
    suggestions: list[str]
    section_checks: dict[str, bool]


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\(cid:\d+\)", " ", text)
    text = re.sub(r"(?<=\w)[./](?=\w)", " ", text)
    text = re.sub(r"[^a-z0-9+#\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def clean_extracted_text(text: str) -> str:
    text = re.sub(r"\(cid:\d+\)", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_keywords(text: str, max_keywords: int = 30) -> list[str]:
    normalized = normalize_text(text)
    words = re.findall(r"[a-z][a-z0-9+#.-]{2,}", normalized)
    stop_words = {
        "and",
        "the",
        "for",
        "with",
        "from",
        "this",
        "that",
        "you",
        "are",
        "will",
        "have",
        "has",
        "your",
        "our",
        "job",
        "role",
        "team",
        "work",
        "using",
        "based",
        "years",
        "skills",
        "experience",
    }
    counts = Counter(word for word in words if word not in stop_words)
    return [word for word, _ in counts.most_common(max_keywords)]


def find_skills(text: str, skill_set: Iterable[str] = SKILL_KEYWORDS) -> set[str]:
    normalized = normalize_text(text)
    found: set[str] = set()
    for skill in skill_set:
        aliases = SKILL_ALIASES.get(skill, (skill,))
        if any(_contains_term(normalized, alias) for alias in aliases):
            found.add(skill)
    return found


def _contains_term(normalized_text: str, term: str) -> bool:
    normalized_term = normalize_text(term)
    pattern = r"(?<![a-z0-9+#])" + re.escape(normalized_term) + r"(?![a-z0-9+#])"
    return bool(re.search(pattern, normalized_text))


def check_sections(resume_text: str) -> dict[str, bool]:
    normalized = normalize_text(resume_text)
    return {
        section: any(keyword in normalized for keyword in keywords)
        for section, keywords in SECTION_KEYWORDS.items()
    }


def analyze_resume(resume_text: str, job_description: str) -> AnalysisResult:
    resume_skills = find_skills(resume_text)
    job_skills = find_skills(job_description)
    matched = sorted(resume_skills & job_skills)
    missing = sorted(job_skills - resume_skills)

    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)
    keyword_overlap = set(resume_keywords) & set(job_keywords)
    section_checks = check_sections(resume_text)

    skill_score = 100 if not job_skills else round((len(matched) / len(job_skills)) * 100)
    keyword_score = 100 if not job_keywords else round((len(keyword_overlap) / min(len(job_keywords), 20)) * 100)
    section_score = round((sum(section_checks.values()) / len(section_checks)) * 100)
    score = round((skill_score * 0.55) + (keyword_score * 0.25) + (section_score * 0.20))

    suggestions = build_suggestions(missing, section_checks, score)

    return AnalysisResult(
        score=max(0, min(score, 100)),
        matched_skills=matched,
        missing_skills=missing,
        resume_keywords=resume_keywords,
        job_keywords=job_keywords,
        suggestions=suggestions,
        section_checks=section_checks,
    )


def build_suggestions(missing_skills: list[str], section_checks: dict[str, bool], score: int) -> list[str]:
    suggestions: list[str] = []
    if missing_skills:
        suggestions.append("Add evidence for these job keywords where truthful: " + ", ".join(missing_skills[:8]) + ".")
    if not section_checks.get("projects"):
        suggestions.append("Add a projects section with measurable outcomes and the tools used.")
    if not section_checks.get("certifications"):
        suggestions.append("List relevant certifications, coursework, or training if you have them.")
    if score < 70:
        suggestions.append("Mirror the job description language more closely in your summary and bullet points.")
    suggestions.append("Use action verbs and metrics, for example reduced time, improved accuracy, or served users.")
    return suggestions


def read_resume_file(file_name: str, content: bytes) -> str:
    suffix = Path(file_name).suffix.lower()
    if suffix == ".txt":
        return clean_extracted_text(content.decode("utf-8", errors="ignore"))
    if suffix == ".pdf":
        return read_pdf(content)
    if suffix == ".docx":
        return read_docx(content)
    raise ValueError("Upload a PDF, DOCX, or TXT resume.")


def read_pdf(content: bytes) -> str:
    import pdfplumber

    text_parts: list[str] = []
    with pdfplumber.open(BytesIO(content)) as pdf:
        for page in pdf.pages:
            text_parts.append(page.extract_text() or "")
    return clean_extracted_text("\n".join(text_parts))


def read_docx(content: bytes) -> str:
    from docx import Document

    document = Document(BytesIO(content))
    return clean_extracted_text("\n".join(paragraph.text for paragraph in document.paragraphs))
