@echo off
title LegalEase Platform Launcher
echo ======================================================
echo          ⚖️  LegalEase - Platform Launcher
echo ======================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "LegalEase Backend" cmd /k "python backend\main.py"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
cd frontend
npm run dev -- --host
