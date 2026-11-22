@echo off
title SewStudio Launcher
cd /d "C:\Users\jazmin\OneDrive\Documentos\proyecto jaz\ProyectoJazmin-main\ProyectoJazmin-main"
echo =========================================================
echo    Iniciando SewStudio con Docker...
echo =========================================================
docker compose up -d --build
echo.
echo Esperando a que el servidor este listo...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo =========================================================
echo    SewStudio esta ejecutandose en http://localhost:3000
echo    Tus datos se guardan automaticamente en Docker.
echo =========================================================
pause
