@echo off
setlocal
set "PYTHON_EXE=%LOCALAPPDATA%\Python\bin\python.exe"

if not exist "%PYTHON_EXE%" (
    echo [ARES] Python was not found at:
    echo        %PYTHON_EXE%
    echo Install Python 3.11+ or update this launcher with your python.exe path.
    pause
    exit /b 1
)

echo [ARES] Starting Document Assistant at http://localhost:8080
echo [ARES] Keep this window open while using PDF ingestion.
"%PYTHON_EXE%" "%~dp0server.py"
