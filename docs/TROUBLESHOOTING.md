# Troubleshooting

## Python is not recognized

Install Python 3.10 or newer from the official Python website. On Windows, enable the "Add Python to PATH" checkbox during installation.

## PowerShell blocks the setup script

Run this command inside the project folder:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup_windows.ps1
```

## The app says a dependency is missing

Run:

```bash
python run.py --install
```

Or install manually:

```bash
python -m pip install -r requirements.txt
```

## Port 8501 is already in use

Run the app on another port:

```bash
python run.py --port 8502
```

## PDF upload does not extract text correctly

Some resumes are image-only scanned PDFs. Convert the resume to a text-based PDF, DOCX, or paste the resume text into the app.

## Virtual environment is broken

Delete the `.venv` folder and run setup again:

```bash
python -m venv .venv
python -m pip install -r requirements.txt
```
