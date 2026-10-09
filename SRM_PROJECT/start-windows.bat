@echo off
REM Starts the PHP backend (port 8080) and the React frontend (port 5173).
cd /d "%~dp0"

set PHP_EXE=php
where php >nul 2>nul
if errorlevel 1 (
  if exist "C:\xampp\php\php.exe" (
    set PHP_EXE=C:\xampp\php\php.exe
  ) else (
    echo PHP not found. Install XAMPP ^(https://www.apachefriends.org^) or add php to PATH.
    pause
    exit /b 1
  )
)

if not exist node_modules (
  echo Installing packages...
  call npm install
)

start "SRM Backend (PHP :8080)" cmd /k ""%PHP_EXE%" -S 127.0.0.1:8080 -t backend"
timeout /t 2 >nul
call npm run dev
