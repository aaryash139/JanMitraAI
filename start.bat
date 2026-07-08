@echo off
echo ========================================================
echo Starting Constituency Intelligence Engine
echo ========================================================
echo.
echo Starting Spring Boot Backend...
start cmd /k "cd backend && gradlew bootRun"

echo Starting React/Vite Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servers are booting up in separate windows.
echo Once started, you can access the dashboard at:
echo http://localhost:5173
echo ========================================================
