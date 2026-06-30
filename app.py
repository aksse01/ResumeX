from __future__ import annotations

import html

import streamlit as st

from resume_analyzer import AnalysisResult, analyze_resume, read_resume_file


st.set_page_config(page_title="ResumeAI Pro", page_icon=":page_facing_up:", layout="wide")


SAMPLE_JOB_DESCRIPTION = """
Software developer or data analyst intern with Python, SQL, JavaScript, React, Power BI,
data analysis, dashboards, Git, communication, problem solving, and project experience.
"""


def inject_styles() -> None:
    st.markdown(
        """
        <style>
        :root {
            --bg: #071017;
            --panel: rgba(16, 25, 36, 0.92);
            --panel-soft: rgba(21, 35, 50, 0.72);
            --line: rgba(138, 160, 182, 0.18);
            --text: #e7edf4;
            --muted: #8fa1b4;
            --cyan: #22d3ee;
            --mint: #28e0a6;
            --blue: #5b8cff;
            --violet: #a66cff;
            --amber: #f5c451;
            --red: #ff6b7a;
        }

        .stApp {
            background:
                radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.16), transparent 32%),
                radial-gradient(circle at 85% 8%, rgba(166, 108, 255, 0.16), transparent 28%),
                linear-gradient(135deg, #071017 0%, #0b1220 46%, #111827 100%);
            color: var(--text);
        }

        .block-container {
            padding-top: 1.2rem;
            padding-bottom: 2rem;
            max-width: 1440px;
        }

        header[data-testid="stHeader"] {
            background: rgba(7, 16, 23, 0);
        }

        [data-testid="stSidebar"] {
            background: linear-gradient(180deg, rgba(8, 14, 24, 0.98), rgba(11, 18, 32, 0.98));
            border-right: 1px solid var(--line);
        }

        [data-testid="stSidebar"] * {
            color: var(--text);
        }

        .hero {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            padding: 1.1rem 1.25rem;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(17, 29, 43, 0.92), rgba(12, 20, 31, 0.92));
            box-shadow: 0 18px 70px rgba(0, 0, 0, 0.24);
        }

        .brand-kicker {
            color: var(--cyan);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.12rem;
            text-transform: uppercase;
        }

        .hero h1 {
            margin: 0.15rem 0 0.25rem;
            font-size: clamp(1.9rem, 4vw, 3.2rem);
            line-height: 1.02;
            letter-spacing: 0;
            color: #ffffff;
        }

        .hero p {
            color: var(--muted);
            margin: 0;
            max-width: 780px;
            font-size: 1rem;
        }

        .hero-badge {
            flex: 0 0 auto;
            display: grid;
            gap: 0.35rem;
            justify-items: end;
            color: var(--muted);
            font-size: 0.86rem;
        }

        .stack-row {
            display: flex;
            gap: 0.45rem;
            flex-wrap: wrap;
            justify-content: flex-end;
        }

        .stack-pill, .chip, .chip-danger, .chip-soft {
            display: inline-flex;
            align-items: center;
            min-height: 28px;
            padding: 0.35rem 0.62rem;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            font-size: 0.8rem;
            font-weight: 650;
            white-space: nowrap;
        }

        .stack-pill {
            color: #dfe8f2;
            background: rgba(91, 140, 255, 0.12);
        }

        .chip {
            color: #c9fff0;
            background: rgba(40, 224, 166, 0.12);
            border-color: rgba(40, 224, 166, 0.28);
        }

        .chip-danger {
            color: #ffd5dc;
            background: rgba(255, 107, 122, 0.12);
            border-color: rgba(255, 107, 122, 0.28);
        }

        .chip-soft {
            color: #d7e3f1;
            background: rgba(143, 161, 180, 0.10);
        }

        .panel {
            min-height: 100%;
            padding: 1rem;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--panel);
            box-shadow: 0 16px 54px rgba(0, 0, 0, 0.22);
        }

        .panel h3 {
            margin: 0 0 0.7rem;
            color: #f7fbff;
            font-size: 1rem;
            letter-spacing: 0;
        }

        .muted {
            color: var(--muted);
            font-size: 0.86rem;
        }

        .score-shell {
            display: grid;
            place-items: center;
            gap: 0.7rem;
        }

        .score-ring {
            --score: 0;
            width: min(210px, 54vw);
            aspect-ratio: 1;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background:
                radial-gradient(circle at center, #101927 0 56%, transparent 57%),
                conic-gradient(var(--mint) calc(var(--score) * 1%), rgba(52, 64, 84, 0.65) 0);
            box-shadow: 0 0 34px rgba(40, 224, 166, 0.2);
        }

        .score-value {
            font-size: 2.75rem;
            font-weight: 850;
            color: #ffffff;
        }

        .score-label {
            color: var(--muted);
            font-size: 0.82rem;
            margin-top: -0.35rem;
        }

        .stat-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0.75rem;
            margin: 0.85rem 0;
        }

        .stat {
            padding: 0.8rem;
            border-radius: 8px;
            border: 1px solid var(--line);
            background: var(--panel-soft);
        }

        .stat span {
            color: var(--muted);
            font-size: 0.78rem;
        }

        .stat strong {
            display: block;
            margin-top: 0.2rem;
            color: #ffffff;
            font-size: 1.35rem;
        }

        .section-card {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 0.45rem 1rem;
            padding: 0.78rem;
            margin-bottom: 0.58rem;
            border-radius: 8px;
            border: 1px solid var(--line);
            background: rgba(13, 23, 35, 0.7);
        }

        .section-card strong {
            color: #f7fbff;
        }

        .section-score {
            color: var(--mint);
            font-weight: 800;
        }

        .section-copy {
            grid-column: 1 / -1;
            color: var(--muted);
            font-size: 0.84rem;
        }

        .tip {
            padding: 0.75rem 0.85rem;
            margin-bottom: 0.55rem;
            border-left: 3px solid var(--cyan);
            border-radius: 6px;
            background: rgba(34, 211, 238, 0.08);
            color: #dbe8f6;
        }

        textarea, input {
            border-radius: 8px !important;
        }

        .stButton > button, .stDownloadButton > button {
            border-radius: 8px;
            border: 1px solid rgba(34, 211, 238, 0.35);
            background: linear-gradient(135deg, #2563eb, #14b8a6);
            color: white;
            font-weight: 750;
        }

        [data-testid="stFileUploader"] {
            border: 1px dashed rgba(34, 211, 238, 0.35);
            border-radius: 8px;
            padding: 0.55rem;
            background: rgba(16, 25, 36, 0.55);
        }

        @media (max-width: 900px) {
            .hero {
                align-items: flex-start;
                flex-direction: column;
            }
            .hero-badge {
                justify-items: start;
            }
            .stack-row {
                justify-content: flex-start;
            }
            .stat-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def esc(value: object) -> str:
    return html.escape(str(value))


def chips(items: list[str], css_class: str = "chip", empty: str = "No items found") -> str:
    if not items:
        return f'<span class="chip-soft">{esc(empty)}</span>'
    return " ".join(f'<span class="{css_class}">{esc(item)}</span>' for item in items)


def score_tone(score: int) -> str:
    if score >= 85:
        return "Recruiter ready"
    if score >= 70:
        return "Competitive"
    if score >= 50:
        return "Needs targeting"
    return "High risk"


def render_hero() -> None:
    st.markdown(
        """
        <div class="hero">
            <div>
                <div class="brand-kicker">NLP Resume Intelligence</div>
                <h1>ResumeAI Pro</h1>
                <p>Analyze student resumes against recruiter job descriptions, detect ATS keyword gaps, and generate targeted improvement guidance.</p>
            </div>
            <div class="hero-badge">
                <div>Tech Stack</div>
                <div class="stack-row">
                    <span class="stack-pill">Python</span>
                    <span class="stack-pill">NLP</span>
                    <span class="stack-pill">React-ready</span>
                    <span class="stack-pill">Flask-ready</span>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def read_resume(uploaded_resume, pasted_resume: str) -> str:
    if uploaded_resume is None:
        return pasted_resume.strip()
    return read_resume_file(uploaded_resume.name, uploaded_resume.getvalue())


def render_score(result: AnalysisResult) -> None:
    st.markdown(
        f"""
        <div class="panel score-shell">
            <h3>ATS Match Score</h3>
            <div class="score-ring" style="--score:{result.score}">
                <div>
                    <div class="score-value">{result.score}%</div>
                    <div class="score-label">{esc(score_tone(result.score))}</div>
                </div>
            </div>
            <div class="muted">Weighted by skill match, keyword coverage, and section quality.</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_stats(result: AnalysisResult) -> None:
    complete_sections = sum(result.section_checks.values())
    total_sections = len(result.section_checks)
    st.markdown(
        f"""
        <div class="stat-grid">
            <div class="stat"><span>Matched Skills</span><strong>{len(result.matched_skills)}</strong></div>
            <div class="stat"><span>Skill Gaps</span><strong>{len(result.missing_skills)}</strong></div>
            <div class="stat"><span>Sections Found</span><strong>{complete_sections}/{total_sections}</strong></div>
            <div class="stat"><span>Job Keywords</span><strong>{len(result.job_keywords)}</strong></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_section_feedback(result: AnalysisResult) -> None:
    cards = []
    for section in result.section_feedback:
        cards.append(
            f"""
            <div class="section-card">
                <strong>{esc(section.name)}</strong>
                <span class="section-score">{section.score}%</span>
                <span class="muted">{esc(section.status)}</span>
                <div class="section-copy">{esc(section.feedback)}</div>
            </div>
            """
        )
    st.markdown('<div class="panel"><h3>Section-wise ATS Feedback</h3>' + "".join(cards) + "</div>", unsafe_allow_html=True)


def render_tips(result: AnalysisResult) -> None:
    tips = "".join(f'<div class="tip">{esc(tip)}</div>' for tip in result.suggestions)
    st.markdown(f'<div class="panel"><h3>Targeted Improvement Tips</h3>{tips}</div>', unsafe_allow_html=True)


def render_analysis(result: AnalysisResult) -> None:
    top_left, top_right = st.columns([0.9, 1.25], gap="large")
    with top_left:
        render_score(result)
    with top_right:
        render_stats(result)
        st.markdown(
            f"""
            <div class="panel">
                <h3>Keyword And Skill Gap Detection</h3>
                <div class="muted">Matched recruiter keywords</div>
                <div style="margin:0.55rem 0 0.85rem;">{chips(result.matched_skills, "chip", "No direct matches yet")}</div>
                <div class="muted">Missing or weakly represented keywords</div>
                <div style="margin-top:0.55rem;">{chips(result.missing_skills, "chip-danger", "No major tracked gaps")}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    lower_left, lower_right = st.columns([1.05, 0.95], gap="large")
    with lower_left:
        render_section_feedback(result)
    with lower_right:
        render_tips(result)
        st.download_button(
            "Export improved version",
            data=result.improved_resume,
            file_name="improved-resume-draft.txt",
            mime="text/plain",
            use_container_width=True,
        )

    with st.expander("Recruiter keyword intelligence", expanded=False):
        st.markdown("**Resume keywords**")
        st.markdown(chips(result.resume_keywords[:20], "chip-soft"), unsafe_allow_html=True)
        st.markdown("**Job description keywords**")
        st.markdown(chips(result.job_keywords[:20], "chip-soft"), unsafe_allow_html=True)


def main() -> None:
    inject_styles()

    with st.sidebar:
        st.markdown("### ResumeAI Pro")
        st.markdown("Student resume analyzer for ATS targeting and recruiter readiness.")
        st.divider()
        st.markdown("**Workflow**")
        st.markdown("1. Upload or paste resume text\n2. Paste a target job description\n3. Review ATS score and tips\n4. Export the improved draft")
        st.divider()
        st.markdown("**Focus Areas**")
        st.markdown("- Keyword gaps\n- Skill alignment\n- Impact and brevity\n- ATS-safe sections")

    render_hero()
    st.write("")

    input_col, job_col = st.columns([1, 1], gap="large")

    with input_col:
        st.markdown('<div class="panel"><h3>Resume Upload</h3>', unsafe_allow_html=True)
        uploaded_resume = st.file_uploader("Upload PDF, DOCX, or TXT", type=["pdf", "docx", "txt"])
        pasted_resume = st.text_area("Resume text", height=245, placeholder="Paste resume text if you do not upload a file.")
        st.markdown("</div>", unsafe_allow_html=True)

    with job_col:
        st.markdown('<div class="panel"><h3>Target Job Description</h3>', unsafe_allow_html=True)
        use_sample = st.toggle("Use sample student developer/data role", value=not bool(st.session_state.get("custom_jd")))
        default_jd = SAMPLE_JOB_DESCRIPTION.strip() if use_sample else ""
        job_description = st.text_area(
            "Job description",
            value=default_jd,
            height=322,
            placeholder="Paste recruiter job description with required skills, tools, responsibilities, and qualifications.",
            key="custom_jd",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    analyze = st.button("Run ATS Analysis", type="primary", use_container_width=True)

    if not analyze:
        st.markdown(
            """
            <div class="panel">
                <h3>Dashboard Ready</h3>
                <div class="muted">Add a resume and job description to generate ATS score, skill gaps, section feedback, and exportable recommendations.</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    try:
        resume_text = read_resume(uploaded_resume, pasted_resume)
    except Exception as exc:
        st.error(str(exc))
        return

    if not resume_text:
        st.warning("Upload or paste a resume first.")
        return

    if not job_description.strip():
        st.warning("Paste a job description first.")
        return

    result = analyze_resume(resume_text, job_description)
    render_analysis(result)


if __name__ == "__main__":
    main()
