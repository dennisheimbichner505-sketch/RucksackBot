@echo off

start cmd /k "cd /d %~dp0 && node bot.js"

timeout /t 3 >nul

start cmd /k "cd /d %~dp0 && ngrok http 3000"

exit