# AI Resume Analyzer

A futuristic resume intelligence dashboard that compares student resumes with recruiter job descriptions and gives an ATS-style match report.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/UI-Streamlit-FF4B4B?logo=streamlit&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- Upload resumes as PDF, DOCX, or TXT files.
- Paste a target job description.
- Get an ATS match score, keyword coverage, missing skills, and improvement tips.
- Review section-wise feedback for impact, brevity, formatting, experience, education, skills, projects, and certifications.
- Export an improved resume draft with targeted keywords and rewrite guidance.
- Run the core analyzer without any paid API key.

## Requirements

- Python 3.10 or newer
- Git
- Internet connection for the first dependency install

## Quick Start

Clone the repository:

```bash
git clone https://github.com/aksse01/AI-Resume-Analyzer-.git
cd AI-Resume-Analyzer-
```

Install dependencies and run with one command:

```bash
python run.py --install
```

Open the local URL shown by Streamlit, usually:

```text
http://localhost:8501
```

## Windows Setup

PowerShell:

```powershell
git clone https://github.com/aksse01/AI-Resume-Analyzer-.git
cd AI-Resume-Analyzer-
.\scripts\setup_windows.ps1
.\scripts\run_windows.ps1
```

If PowerShell blocks scripts, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup_windows.ps1
.\scripts\run_windows.ps1
```

## macOS/Linux Setup

```bash
git clone https://github.com/aksse01/AI-Resume-Analyzer-.git
cd AI-Resume-Analyzer-
chmod +x scripts/*.sh
./scripts/setup_unix.sh
./scripts/run_unix.sh
```

## Manual Setup

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
streamlit run app.py
```

## Sample Job Description

The file `sample_job_description.txt` contains a ready-to-paste sample job description for testing the app quickly.

## Test

```bash
python -m unittest discover -s tests
```

## Project Structure

```text
app.py                 Futuristic Streamlit dashboard
run.py                 Cross-platform launcher and dependency checker
resume_analyzer.py     Resume parsing and scoring logic
sample_job_description.txt
scripts/               Windows and macOS/Linux setup/run scripts
tests/                 Unit tests for the analyzer
requirements.txt       Python dependencies
```

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common setup fixes.
