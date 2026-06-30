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
class SectionFeedback:
    name: str
    score: int
    status: str
    feedback: str


@dataclass(frozen=True)
class AnalysisResult:
    score: int
    matched_skills: list[str]
    missing_skills: list[str]
    resume_keywords: list[str]
    job_keywords: list[str]
    suggestions: list[str]
    section_checks: dict[str, bool]
    section_feedback: list[SectionFeedback]
    improved_resume: str


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
    section_feedback = build_section_feedback(resume_text, section_checks)

    skill_score = 100 if not job_skills else round((len(matched) / len(job_skills)) * 100)
    keyword_score = 100 if not job_keywords else round((len(keyword_overlap) / min(len(job_keywords), 20)) * 100)
    section_score = round(sum(section.score for section in section_feedback) / len(section_feedback))
    score = round((skill_score * 0.55) + (keyword_score * 0.25) + (section_score * 0.20))

    suggestions = build_suggestions(missing, section_checks, section_feedback, score)
    improved_resume = build_improved_resume(resume_text, job_description, missing, suggestions)

    return AnalysisResult(
        score=max(0, min(score, 100)),
        matched_skills=matched,
        missing_skills=missing,
        resume_keywords=resume_keywords,
        job_keywords=job_keywords,
        suggestions=suggestions,
        section_checks=section_checks,
        section_feedback=section_feedback,
        improved_resume=improved_resume,
    )


def build_section_feedback(resume_text: str, section_checks: dict[str, bool]) -> list[SectionFeedback]:
    normalized = normalize_text(resume_text)
    bullet_count = len(re.findall(r"(^|\n)\s*[-*\u2022]", resume_text))
    metric_count = len(re.findall(r"\b\d+%?|\b\d{1,3}(?:,\d{3})+\b", resume_text))
    word_count = len(normalized.split())

    impact_score = min(100, 45 + metric_count * 12 + bullet_count * 3)
    brevity_score = 88 if 250 <= word_count <= 650 else 62 if word_count < 250 else 70
    formatting_score = min(100, 55 + sum(section_checks.values()) * 9)

    feedback = [
        SectionFeedback(
            "Impact",
            impact_score,
            _status_for_score(impact_score),
            "Use measurable outcomes in bullets, such as users served, time saved, accuracy, revenue, or scale.",
        ),
        SectionFeedback(
            "Brevity",
            brevity_score,
            _status_for_score(brevity_score),
            "Keep bullets concise and recruiter-scannable; aim for one clear result per bullet.",
        ),
        SectionFeedback(
            "Formatting",
            formatting_score,
            _status_for_score(formatting_score),
            "Use clear section headings, consistent dates, and ATS-safe text instead of heavy graphics or tables.",
        ),
    ]

    for section, present in section_checks.items():
        score = 92 if present else 38
        feedback.append(
            SectionFeedback(
                section.title(),
                score,
                _status_for_score(score),
                "Detected in resume." if present else f"Add a dedicated {section} section with role-relevant details.",
            )
        )

    return feedback


def _status_for_score(score: int) -> str:
    if score >= 85:
        return "Strong"
    if score >= 70:
        return "Good"
    if score >= 50:
        return "Needs polish"
    return "Missing"


def build_suggestions(
    missing_skills: list[str],
    section_checks: dict[str, bool],
    section_feedback: list[SectionFeedback],
    score: int,
) -> list[str]:
    suggestions: list[str] = []
    if missing_skills:
        suggestions.append("Add evidence for these job keywords where truthful: " + ", ".join(missing_skills[:8]) + ".")
    if not section_checks.get("projects"):
        suggestions.append("Add a projects section with measurable outcomes and the tools used.")
    if not section_checks.get("certifications"):
        suggestions.append("List relevant certifications, coursework, or training if you have them.")
    weak_sections = [section.name for section in section_feedback if section.score < 70]
    if weak_sections:
        suggestions.append("Prioritize these weak areas first: " + ", ".join(weak_sections[:5]) + ".")
    if score < 70:
        suggestions.append("Mirror the job description language more closely in your summary and bullet points.")
    suggestions.append("Use action verbs and metrics, for example reduced time, improved accuracy, or served users.")
    return suggestions


def build_improved_resume(
    resume_text: str,
    job_description: str,
    missing_skills: list[str],
    suggestions: list[str],
) -> str:
    resume_lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    name = resume_lines[0] if resume_lines else "Candidate Name"
    target_keywords = ", ".join(extract_keywords(job_description, 12))
    missing_line = ", ".join(missing_skills[:8]) if missing_skills else "No major tracked skill gaps found"
    original_excerpt = "\n".join(resume_lines[:24])

    return "\n".join(
        [
            name,
            "",
            "TARGETED PROFESSIONAL SUMMARY",
            "Software and data-focused candidate with hands-on project experience, strong problem-solving ability,",
            "and role-aligned technical skills. Ready to contribute to recruiter priorities around delivery,",
            "quality, collaboration, and measurable business impact.",
            "",
            "ATS KEYWORDS TO INCLUDE WHERE TRUE",
            target_keywords or "Paste a detailed job description to generate stronger keyword targets.",
            "",
            "SKILL GAPS TO ADDRESS",
            missing_line,
            "",
            "REWRITE CHECKLIST",
            *[f"- {suggestion}" for suggestion in suggestions],
            "",
            "ORIGINAL RESUME EXCERPT",
            original_excerpt,
        ]
    )


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
