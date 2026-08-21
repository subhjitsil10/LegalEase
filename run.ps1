# LegalTech AI Full-Stack Platform Launcher
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ⚖️  LegalTech AI - Full-Stack Launcher  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$backendJob = Start-Process python -ArgumentList "backend/main.py" -PassThru -NoNewWindow
Write-Host "🚀 FastAPI Backend running on http://localhost:8000" -ForegroundColor Green

Set-Location frontend
Write-Host "✨ Starting Vite React Frontend on http://localhost:5173" -ForegroundColor Green
npm run dev
