# Script PowerShell para iniciar Backend y Frontend
# Uso: .\start-all.ps1

Write-Host "🚀 Iniciando Kiro Shoes Inventory System..." -ForegroundColor Green
Write-Host ""

# Verificar que las carpetas existan
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'backend'" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: No se encuentra la carpeta 'frontend'" -ForegroundColor Red
    exit 1
}

# Iniciar Backend en una nueva ventana de PowerShell
Write-Host "🔧 Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 BACKEND - Kiro Shoes' -ForegroundColor Cyan; Write-Host ''; npm run dev"

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Iniciar Frontend en una nueva ventana de PowerShell
Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 FRONTEND - Kiro Shoes' -ForegroundColor Magenta; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "✅ Servicios iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs importantes:" -ForegroundColor Cyan
Write-Host "   Backend API:      http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend:         http://localhost:5173" -ForegroundColor White
Write-Host "   Panel Admin:      http://localhost:5173/admin/" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Credenciales Admin:" -ForegroundColor Cyan
Write-Host "   Email:    maymesm@yahoo.com" -ForegroundColor White
Write-Host "   Password: Solislidia123" -ForegroundColor White
Write-Host ""
Write-Host "ℹ️  Para detener los servicios, presiona Ctrl+C en cada ventana" -ForegroundColor Gray
Write-Host ""
