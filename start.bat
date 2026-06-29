@echo off
cd /d "%~dp0"

echo ====================================
echo      RucksackBot startet...
echo ====================================
echo.

echo [1/4] Suche nach Updates...
git pull

echo.
echo [2/4] Installiere Pakete...
call npm install

echo.
echo [3/4] Starte Bot...
start "RucksackBot" cmd /k "cd /d %~dp0 && node bot.js"

echo.
echo Warte 3 Sekunden...
timeout /t 3 >nul

echo.
echo [4/4] Starte ngrok...
start "ngrok" cmd /k "cd /d %~dp0 && ngrok http 3000"

echo.
echo Fertig!
pause