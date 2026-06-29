@echo off
REM Script CMD para iniciar Backend y Frontend
REM Uso: start-all.bat

echo.
echo ============================================
echo   KIRO SHOES INVENTORY SYSTEM
echo ============================================
echo.

REM Verificar que las carpetas existan
if not exist "backend\" (
    echo [ERROR] No se encuentra la carpeta 'backend'
    pause
    exit /b 1
)

if not exist "frontend\" (
    echo [ERROR] No se encuentra la carpeta 'frontend'
    pause
    exit /b 1
)

echo [*] Iniciando Backend...
start "Backend - Kiro Shoes" cmd /k "cd backend && npm run dev"

REM Esperar 2 segundos
timeout /t 2 /nobreak >nul

echo [*] Iniciando Frontend...
start "Frontend - Kiro Shoes" cmd /k "cd frontend && npm run dev"

echo.
echo [OK] Servicios iniciados!
echo.
echo URLs importantes:
echo   Backend API:  http://localhost:3000
echo   Frontend:     http://localhost:5173
echo   Panel Admin:  http://localhost:5173/admin/
echo.
echo Credenciales Admin:
echo   Email:    maymesm@yahoo.com
echo   Password: Solislidia123
echo.
echo Para detener los servicios, cierra las ventanas o presiona Ctrl+C
echo.
pause
