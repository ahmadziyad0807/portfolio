#!/bin/bash

# Setup script for Ollama model in Docker environment

echo "Setting up Ollama with Mistral 7B model..."

# Wait for Ollama service to be ready
echo "Waiting for Ollama service to start..."
until curl -f http://localhost:11434/api/tags >/dev/null 2>&1; do
    echo "Waiting for Ollama to be ready..."
    sleep 5
done

echo "Ollama is ready! Pulling Mistral 7B model..."

# Pull the Mistral 7B model
docker exec intelligen-ollama ollama pull mistral:7b

if [ $? -eq 0 ]; then
    echo "✅ Mistral 7B model successfully downloaded!"
    echo "🚀 Your development environment is ready!"
    echo ""
    echo "Access points:"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:3001"
    echo "- Health check: http://localhost:3001/health"
    echo "- Ollama API: http://localhost:11434"
else
    echo "❌ Failed to download Mistral 7B model"
    echo "Please check your internet connection and try again"
    exit 1
fi