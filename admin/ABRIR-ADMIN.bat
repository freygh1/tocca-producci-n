@echo off
cd /d "%~dp0.."
echo.
echo ========================================
echo   INICIANDO TOCCA ADMIN
echo ========================================
echo.
echo Abriendo servidor local...
start powershell -NoExit -ExecutionPolicy Bypass -File "admin\server.ps1"
timeout /t 3 /nobreak >nul
echo.
echo Abriendo navegador...
start http://localhost:8080/admin/index.html
echo.
echo LISTO! El admin se abrira en tu navegador.
echo.
pause
