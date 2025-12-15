@echo off
echo Setting up Ollama with Mistral 7B model...

echo Waiting for Ollama service to start...
:wait_loop
curl -f http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Waiting for Ollama to be ready...
    timeout /t 5 /nobreak >nul
    goto wait_loop
)

echo Ollama is ready! Pulling Mistral 7B model...

docker exec intelligen-ollama ollama pull mistral:7b

if %errorlevel% equ 0 (
    echo ✅ Mistral 7B model successfully downloaded!
    echo 🚀 Your development environment is ready!
    echo.
    echo Access points:
    echo - Frontend: http://localhost:3000
    echo - Backend API: http://localhost:3001
    echo - Health check: http://localhost:3001/health
    echo - Ollama API: http://localhost:11434
) else (
    echo ❌ Failed to download Mistral 7B model
    echo Please check your internet connection and try again
    exit /b 1
)