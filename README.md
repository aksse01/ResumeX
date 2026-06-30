# AI Resume Analyzer

A futuristic resume intelligence dashboard that compares student resumes with recruiter job descriptions and gives an ATS-style match report.

## Features

- Upload resumes as PDF, DOCX, or TXT files.
- Paste a target job description.
- Get an ATS match score, keyword coverage, missing skills, and improvement tips.
- Review section-wise feedback for impact, brevity, formatting, experience, education, skills, projects, and certifications.
- Export an improved resume draft with targeted keywords and rewrite guidance.
- Run the core analyzer without any paid API key.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
streamlit run app.py
```

Then open the local URL shown by Streamlit.

## Test

```bash
python -m unittest discover -s tests
```

## Project Structure

```text
app.py                 Futuristic Streamlit dashboard
resume_analyzer.py     Resume parsing and scoring logic
tests/                 Unit tests for the analyzer
requirements.txt       Python dependencies
```
