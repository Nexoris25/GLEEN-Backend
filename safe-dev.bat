@echo off
echo =====================================
echo SAFE DEV MODE - GLEEN API
echo =====================================

REM Hard limit Node memory (2GB)
set NODE_OPTIONS=--max-old-space-size=2048

REM Go to project root
cd /d C:\app\nextjs\gleenapi

REM Run NestJS CLI directly (Windows-safe)
echo Starting NestJS safely (no watcher)...
node node_modules\@nestjs\cli\bin\nest.js start --watch=false

pause
