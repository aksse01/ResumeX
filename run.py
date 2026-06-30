from __future__ import annotations

import argparse
import importlib.util
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
REQUIREMENTS_FILE = PROJECT_ROOT / "requirements.txt"
REQUIRED_MODULES = {
    "streamlit": "streamlit",
    "pdfplumber": "pdfplumber",
    "docx": "python-docx",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the AI Resume Analyzer app.")
    parser.add_argument("--install", action="store_true", help="Install missing dependencies before launching.")
    parser.add_argument("--port", default="8501", help="Streamlit port to use. Default: 8501.")
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser automatically.")
    return parser.parse_args()


def check_python_version() -> None:
    if sys.version_info < (3, 10):
        raise SystemExit("Python 3.10 or newer is required. Install Python from https://www.python.org/downloads/")


def missing_dependencies() -> list[str]:
    missing: list[str] = []
    for module_name, package_name in REQUIRED_MODULES.items():
        if importlib.util.find_spec(module_name) is None:
            missing.append(package_name)
    return missing


def install_dependencies() -> None:
    if not REQUIREMENTS_FILE.exists():
        raise SystemExit("requirements.txt was not found. Run this command from the project folder.")

    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)])


def launch_streamlit(port: str, no_browser: bool) -> None:
    command = [
        sys.executable,
        "-m",
        "streamlit",
        "run",
        str(PROJECT_ROOT / "app.py"),
        "--server.port",
        port,
    ]
    if no_browser:
        command.extend(["--server.headless", "true"])

    subprocess.check_call(command)


def main() -> None:
    args = parse_args()
    check_python_version()

    missing = missing_dependencies()
    if missing and not args.install:
        packages = ", ".join(missing)
        raise SystemExit(
            f"Missing dependencies: {packages}\n"
            "Run one of these commands:\n"
            "  python run.py --install\n"
            "  python -m pip install -r requirements.txt"
        )

    if missing:
        install_dependencies()

    launch_streamlit(args.port, args.no_browser)


if __name__ == "__main__":
    main()
