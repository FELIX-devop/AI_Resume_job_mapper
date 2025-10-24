#!/bin/bash

# AI Resume-Job Matching System Setup Script
# This script sets up the complete system on macOS ARM

set -e

echo "🚀 Setting up AI Resume-Job Matching System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop for Mac."
    echo "   Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please update Docker Desktop."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p sample_data
mkdir -p docs
mkdir -p presentation

# Check if ports are available
echo "🔍 Checking port availability..."
ports=(3000 8080 8000 27017)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Please stop the service using this port."
        echo "   You can check what's using it with: lsof -i :$port"
        exit 1
    fi
done

echo "✅ All required ports are available"

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check ML service
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ ML Service is healthy"
else
    echo "❌ ML Service is not responding"
    echo "   Check logs with: docker logs resume-matcher-ml-service"
fi

# Check backend
if curl -f http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "✅ Backend Service is healthy"
else
    echo "❌ Backend Service is not responding"
    echo "   Check logs with: docker logs resume-matcher-backend"
fi

# Check frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend Service is healthy"
else
    echo "❌ Frontend Service is not responding"
    echo "   Check logs with: docker logs resume-matcher-frontend"
fi

# Check MongoDB
if docker exec resume-matcher-mongodb mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB is not responding"
    echo "   Check logs with: docker logs resume-matcher-mongodb"
fi

# Train ML models
echo "🤖 Training ML models..."
docker exec resume-matcher-ml-service python train.py

if [ $? -eq 0 ]; then
    echo "✅ ML models trained successfully"
else
    echo "❌ ML model training failed"
    echo "   Check logs with: docker logs resume-matcher-ml-service"
fi

# Display access information
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080"
echo "   ML Service: http://localhost:8000"
echo "   MongoDB: localhost:27017"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Remove everything: docker-compose down -v"
echo ""
echo "📚 Documentation:"
echo "   README: ./README.md"
echo "   Demo instructions: ./docs/demo-instructions.md"
echo "   API documentation: ./docs/api-spec.json"
echo ""
echo "🧪 Test the system:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Upload a resume file"
echo "   3. Enter a job description"
echo "   4. View the analysis results"
echo ""
echo "✨ Happy matching!"
