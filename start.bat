@echo off
echo =========================================
echo   LegalTech AI - Full-Stack Platform
echo =========================================
start cmd /k "python backend\main.py"
cd frontend
npm run dev
